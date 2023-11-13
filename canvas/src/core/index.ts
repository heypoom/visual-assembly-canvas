import { produce } from "immer"
import setup, { Controller } from "machine-wasm"

import { $nodes } from "../store/nodes"

import {
  setError,
  setMachineState,
  clearPreviousRun,
  $output,
} from "../store/results"

import { getSourceHighlightMap } from "./utils/getHighlightedSourceLine"

import {
  MachineStatus,
  CanvasError,
  canvasErrors,
  MachineError,
} from "../types/MachineState"

import { InspectionState } from "../types/MachineEvent"
import { $status } from "../store/status"
import {
  isMachineNode,
  isOscNode,
  isPixelNode,
  isPlotterNode,
  isTapNode,
} from "../canvas/blocks/utils/is"
import { $delay } from "../store/canvas"

export const setSource = (id: number, source: string) => {
  const nodes = produce($nodes.get(), (nodes) => {
    const node = nodes.find((n) => n.data.id === id)

    if (!node) {
      console.error(`node not found in node ${id} when setting source.`)
      return
    }

    if (isMachineNode(node)) node.data.source = source
  })

  $nodes.set(nodes)
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const machineError = (cause: MachineError): CanvasError => ({
  MachineError: { cause },
})

export type HighlighterFn = (lineNo: number) => void

export class CanvasManager {
  ctx: Controller | null = null

  /** What is the limit on number of cycles? This prevents crashes. */
  maxCycle = 200

  /** Is every machine ready to run? */
  ready = false

  /** Should machine prepare to stop execution? */
  stop = false

  sources: Map<number, string> = new Map()

  highlighters: Map<number, HighlighterFn> = new Map()
  highlightMaps: Map<number, Map<number, number>> = new Map()

  async setup() {
    await setup()
    this.ctx = Controller.create()
  }

  load(id: number, source: string, force?: boolean) {
    // If the source is the same, we don't need to reload.
    if (this.sources.get(id) === source && !force) return this.invalidate()
    this.sources.set(id, source)

    try {
      this.ctx?.load(id, source)
      this.setSyntaxError(id, null)
      this.highlightMaps.set(id, getSourceHighlightMap(source))
      this.invalidate()
    } catch (error) {
      console.log("syntax error ->", error)

      this.setSyntaxError(id, error)
    }
  }

  setSyntaxError(id: number, error: unknown | null) {
    if (error) setError(id, error as CanvasError)
  }

  inspect(id: number): InspectionState {
    return this.ctx?.inspect(id)
  }

  prepare = () => {
    if (this.ready) return

    this.ctx?.ready()
    this.ready = true

    clearPreviousRun(this)
  }

  get isHalted(): boolean {
    return this.ctx?.is_halted() ?? false
  }

  get delayMs(): number {
    return $delay.get()
  }

  run = async () => {
    this.prepare()
    $status.setKey("running", true)

    let cycle = 0

    while (cycle < this.maxCycle && !this.isHalted) {
      // Execution is forced to stop by the user.
      if (this.stop) {
        this.stop = false
        break
      }

      this.step({ batch: true })

      // Add an artificial delay to allow the user to see the changes
      if (this.delayMs > 0) await delay(this.delayMs)

      cycle++
    }

    // extra step to let the blocks tick
    this.step({ batch: true })

    this.invalidate()
    $status.setKey("running", false)

    setTimeout(() => {
      if (cycle >= this.maxCycle && !this.isHalted) {
        this.statuses.forEach((status, id) => {
          const error = this.getCycleError(id, status)
          if (error) setError(id, machineError(error))
        })
      }
    }, 10)
  }

  invalidate() {
    this.ready = false
  }

  getCycleError(id: number, status: MachineStatus): MachineError | undefined {
    if (status === "Running") return { ExecutionCycleExceeded: { id } }
    if (status === "Awaiting") return { MessageNeverReceived: { id } }
  }

  get statuses(): Map<number, MachineStatus> {
    return this.ctx?.statuses()
  }

  step = (config: { batch?: boolean } = {}) => {
    this.prepare()

    try {
      this.ctx?.step()
    } catch (error) {
      this.detectCanvasError(error)
    }

    // Synchronize the machine state with the store.
    setMachineState(this)

    // Highlight the current line.
    if (!config.batch || this.delayMs > 0) this.highlightCurrent()

    this.updateBlocks()

    // If running in steps, we should reset the machine once it halts.
    if (!config.batch && this.isHalted) this.reloadMachines()
  }

  updateBlocks() {
    // TODO: optimize data transfer. only get the "data" field, not the full block.
    const blocks = this.ctx?.get_blocks()

    for (const block of blocks) {
      // TODO: refactor this
      const next = produce($nodes.get(), (nodes) => {
        const node = nodes.find((n) => n.data.id === block.id)

        if (!node) {
          console.error(`node not found for block "${block.id}" when updating.`)
          return
        }

        if (isPixelNode(node)) {
          node.data = { ...node.data, ...block.data.PixelBlock }
        }

        if (isOscNode(node)) {
          node.data = { ...node.data, ...block.data.OscBlock }
        }

        if (isPlotterNode(node)) {
          node.data = { ...node.data, ...block.data.PlotterBlock }
        }

        if (isTapNode(node)) {
          node.data = { ...node.data, ...block.data.TapBlock }
        }
      })

      $nodes.set(next)
    }
  }

  detectCanvasError(error: unknown) {
    const e = error as CanvasError

    if (canvasErrors.disconnectedPort(e)) {
      const id = e.DisconnectedPort.port?.block
      setError(id, e)
      return
    }

    if (canvasErrors.machineError(e)) {
      const { cause } = e.MachineError

      const inner = Object.values(cause)[0]
      if (inner?.id) setError(inner.id, e)

      return
    }

    console.error("Unhandled canvas error:", error)
  }

  highlightCurrent() {
    const output = $output.get()

    this.highlighters.forEach((highlight, id) => {
      const mapping = this.highlightMaps.get(id)
      const state = output[id]
      const pc = state?.registers?.pc ?? 0
      const lineNo = (mapping?.get(pc) ?? 0) + 1

      highlight(lineNo)
    })
  }

  reloadMachines() {
    this.sources.forEach((source, id) => {
      this.load(id, source, true)
    })
  }

  resetBlocks() {
    // Reset blocks and update UI
    this.ctx?.reset_blocks()
    this.updateBlocks()

    // Reset machines and update UI
    this.reloadMachines()
    setMachineState(this)
  }
}

export const manager = new CanvasManager()
await manager.setup()

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.manager = manager
