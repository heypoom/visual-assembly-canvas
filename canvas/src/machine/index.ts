import { produce } from "immer"
import setup, { Controller } from "machine-wasm"

import { $nodes, addNode } from "../store/nodes.ts"

import { Machine } from "../types/Machine.ts"
import { BlockNode } from "../types/Node.ts"

import {
  setError,
  setMachineState,
  clearPreviousRun,
} from "../store/results.ts"

import { MachineError, MachineStatus } from "../types/MachineState.ts"
import { InspectionState } from "../types/MachineEvent.ts"

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

export class MachineManager {
  ctx: Controller | null = null

  /** How long do we delay, in milliseconds. */
  delayMs = 0

  /** What is the limit on number of cycles? This prevents crashes. */
  maxCycle = 200

  ready = false

  sources: Record<number, string> = {}
  hasSyntaxError: Record<number, boolean> = {}

  async setup() {
    await setup()
    this.ctx = Controller.create()
  }

  load(id: number, source: string) {
    // If the source is the same, we don't need to reload.
    if (this.sources[id] === source) {
      this.ready = false
      return
    }

    try {
      this.ctx?.load(Number(id), source)
      this.setSyntaxError(id, null)
      this.ready = false
      this.sources = { ...this.sources, [id]: source }
    } catch (error) {
      this.setSyntaxError(id, error)
    }
  }

  setSyntaxError(id: number, error: unknown | null) {
    if (error) setError(id, error as MachineError)
    this.hasSyntaxError = { ...this.hasSyntaxError, [id]: !!error }
  }

  inspect(id: number): InspectionState {
    return this.ctx?.inspect(id)
  }

  prepare = () => {
    if (this.ready) return

    console.log(">> preparing new runs...")
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

    // If running in steps, we should reset the machine once it halts.
    if (!config.batch && this.isHalted) {
      console.log(">> step completed! resetting...")
      this.ready = false
    }

    setMachineState(this)
  }
}

export const manager = new MachineManager()
await manager.setup()

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.manager = manager
