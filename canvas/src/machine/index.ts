import { produce } from "immer"
import setup, { Controller } from "machine-wasm"

import { $nodes, addNode } from "../store/nodes"

import { Machine } from "../types/Machine"
import { BlockNode } from "../types/Node"

import {
  setError,
  setMachineState,
  clearPreviousRun,
  $output,
} from "../store/results"

import { getSourceHighlightMap } from "./utils/getHighlightedSourceLine"

import { ErrorKeys, MachineError, MachineStatus } from "../types/MachineState"
import { InspectionState } from "../types/MachineEvent"
import { $status } from "../store/status"

const rand = () => Math.floor(Math.random() * 500)

const DEFAULT_SOURCE = "push 0xAA\n\n\n\n"

export function addMachine() {
  const id = manager.ctx?.add()
  if (id === undefined) return

  const machine: Machine = { id, source: DEFAULT_SOURCE }
  manager.load(id, machine.source)

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
  delayMs = 40

  /** What is the limit on number of cycles? This prevents crashes. */
  maxCycle = 200

  /** Is every machine ready to run? */
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
    if (this.sources.get(id) === source && !force) return this.invalidate()
    this.sources.set(id, source)

    try {
      this.ctx?.load(id, source)
      this.setSyntaxError(id, null)
      this.highlightMaps.set(id, getSourceHighlightMap(source))
      this.invalidate()
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
    $status.setKey("running", true)

    let cycle = 0

    while (cycle < this.maxCycle && !this.isHalted) {
      this.step({ batch: true })

      // Add an artificial delay to allow the user to see the changes
      if (this.delayMs > 0) await delay(this.delayMs)

      cycle++
    }

    this.invalidate()
    $status.setKey("running", false)

    setTimeout(() => {
      if (cycle >= this.maxCycle && !this.isHalted) {
        this.statuses.forEach((status, id) => {
          const error = this.getCycleError(id, status)
          if (error) setError(id, error)
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
      // Determine the runtime error type and report them.
      this.detectError(error, "ExecutionFailed")
      this.detectError(error, "MessageNeverReceived")
    }

    // Synchronize the machine state with the store.
    setMachineState(this)

    // Highlight the current line.
    if (!config.batch || this.delayMs > 0) this.highlightCurrent()

    // If running in steps, we should reset the machine once it halts.
    if (!config.batch && this.isHalted) this.reloadAll()
  }

  /** If the error matches the defined type, report them. */
  detectError<K extends ErrorKeys>(error: unknown, type: K) {
    const e = error as Record<K, { id: number }>
    if (type in e) setError(e[type].id, e as MachineError)
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

  reloadAll() {
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
