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

  /** Should machine prepare to pause execution? */
  pause = false

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

  /**
   * Indicate that we should run until pause, without any cycle limit or halting checks.
   */
  get runUntilPause(): boolean {
    return this.delayMs > 0 && this.hasProducers
  }

  /**
   * Does the canvas has any signal producers?
   * This is used to determine if we should run until pause.
   */
  get hasProducers() {
    return $nodes.get().some((node) => isOscNode(node))
  }

  setRunning(state: boolean) {
    $status.setKey("running", state)
  }

  /** Continue the execution. */
  run = async () => {
    const startMs = performance.now()
    this.setRunning(true)

    // Should we enable halting detection?
    const runUntilPause = this.runUntilPause
    const detectHalt = !runUntilPause
    let cycle = 0

    while (runUntilPause || cycle < this.maxCycle) {
      // Execution is forced to pause by the user.
      if (this.pause) {
        this.pause = false
        break
      }

      this.step({ batch: true })

      // Add an artificial delay to allow the user to see the changes
      if (this.delayMs > 0) await delay(this.delayMs)

      if (detectHalt) cycle++
    }

    // extra step to let the blocks tick
    this.step({ batch: true })

    this.setRunning(false)
    if (detectHalt) this.detectHalt(cycle)

    const duration = performance.now() - startMs

    if (this.delayMs === 0 && duration > 300) {
      console.warn(`a slow run took ${duration}ms to execute!`)
    }
  }

  /** Check if our program ever halts. Helps prevent hangs, infinite loops, and awaiting for messages. */
  detectHalt(cycle: number) {
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
    // If the program is not initialized yet, we need to initialize it.
    this.prepare()

    try {
      this.ctx?.step()
    } catch (error) {
      this.detectCanvasError(error)
    }

    // Synchronize the machine state with the store.
    setMachineState(this)

    // Highlight the current line.
    if (this.delayMs > 0) this.highlightCurrent()

    // Tick the blocks.
    this.updateBlocks()

    // TODO: add an indicator to the block for a halted machine.
    // TODO: we should remove this behaviour to prevent confusion!
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

  reset() {
    const { running } = $status.get()
    if (running) this.pause = true

    // Invalidate the ready flag.
    this.invalidate()

    // Reset blocks and update UI
    this.ctx?.reset_blocks()
    this.updateBlocks()

    // Reset machines and update UI
    this.reloadMachines()
    setMachineState(this)
  }

  removeBlock(id: number) {
    // Remove the block.
    this.ctx?.remove_block(id)

    // Teardown the code editor state.
    this.sources.delete(id)
    this.highlightMaps.delete(id)
  }
}

export const manager = new CanvasManager()
await manager.setup()

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.manager = manager
