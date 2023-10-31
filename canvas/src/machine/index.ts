import { produce } from "immer"
import setup, { Controller } from "machine-wasm"

import { $nodes, addNode } from "../store/nodes.ts"

import { Machine } from "../types/Machine.ts"
import { BlockNode } from "../types/Node.ts"

import {
  setError,
  setMachineState,
  clearPreviousRun,
  $output,
} from "../store/results.ts"

import { MachineError, MachineStatus } from "../types/MachineState.ts"
import { InspectionState } from "../types/MachineEvent.ts"
import { getSourceHighlightMap } from "../inspector/utils/getHighlightedSourceLine.ts"

const rand = () => Math.floor(Math.random() * 500)

export function addMachine() {
  const id = manager.ctx?.add()
  if (id === undefined) return

  const machine: Machine = { id, source: "push 5\n\n\n\n" }

  const node: BlockNode = {
    id: id.toString(),
    type: "machine",
    data: machine,
    position: { x: rand(), y: rand() },
  }

  addNode(node)
}

export const setSource = (id: number, source: string) => {
  const nodes = produce($nodes.get(), (nodes) => {
    nodes[id].data.source = source
  })

  $nodes.set(nodes)
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export type HighlighterFn = (lineNo: number) => void

export class MachineManager {
  ctx: Controller | null = null

  /** How long do we delay, in milliseconds. */
  delayMs = 0

  /** What is the limit on number of cycles? This prevents crashes. */
  maxCycle = 200

  ready = false

  sources: Map<number, string> = new Map()

  highlighters: Map<number, HighlighterFn> = new Map()
  highlightMaps: Map<number, Map<number, number>> = new Map()

  async setup() {
    await setup()
    this.ctx = Controller.create()
  }

  load(id: number, source: string, force?: boolean) {
    // If the source is the same, we don't need to reload.
    if (this.sources.get(id) === source && !force) {
      this.ready = false
      return
    }

    try {
      this.ctx?.load(id, source)
      this.setSyntaxError(id, null)
      this.highlightMaps.set(id, getSourceHighlightMap(source))
      this.ready = false
      this.sources.set(id, source)
    } catch (error) {
      this.setSyntaxError(id, error)
    }
  }

  setSyntaxError(id: number, error: unknown | null) {
    if (error) setError(id, error as MachineError)
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

  run = async () => {
    this.prepare()

    let cycle = 0

    while (cycle < this.maxCycle && !this.isHalted) {
      this.step({ batch: true })

      // Add an artificial delay to allow the user to see the changes
      if (this.delayMs > 0) await delay(this.delayMs)

      cycle++
    }

    setTimeout(() => {
      if (cycle >= this.maxCycle && !this.isHalted) {
        this.statuses.forEach((status, id) => {
          const error = this.getCycleError(id, status)
          if (error) setError(id, error)
        })
      }
    }, 10)
  }

  getCycleError(id: number, status: MachineStatus): MachineError | undefined {
    if (status === "Running") return { ExecutionCycleExceeded: { id } }
    if (status === "Awaiting") return { HangingAwaits: { id } }
  }

  get statuses(): Map<number, MachineStatus> {
    return this.ctx?.statuses()
  }

  step = (config: { batch?: boolean } = {}) => {
    this.prepare()

    try {
      this.ctx?.step()
    } catch (error) {
      const err = error as MachineError

      if ("ExecutionFailed" in err) {
        setError(err.ExecutionFailed.id, err)
      }
    }

    // Synchronize the machine state with the store.
    setMachineState(this)

    // Highlight the current line.
    if (!config.batch || this.delayMs > 0) this.highlightCurrent()

    // If running in steps, we should reset the machine once it halts.
    if (!config.batch && this.isHalted) this.reload()
  }

  highlightCurrent() {
    const output = $output.get()

    this.highlighters.forEach((highlight, id) => {
      const mapping = this.highlightMaps.get(id)
      if (!mapping) {
        console.log(`[HL:${id}] no mapping found!!`)
        return
      }

      const state = output[id]
      const pc = state?.registers?.pc ?? 0
      const lineNo = (mapping?.get(pc) ?? 0) + 1

      highlight(lineNo)
    })
  }

  reload() {
    this.sources.forEach((source, id) => {
      this.load(id, source, true)
    })
  }
}

export const manager = new MachineManager()
await manager.setup()

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.manager = manager
