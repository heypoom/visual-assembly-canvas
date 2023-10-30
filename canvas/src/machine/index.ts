import { produce } from "immer"
import setup, { Controller } from "machine-wasm"

import { $nodes, addNode } from "../store/nodes.ts"

import { Machine } from "../types/Machine.ts"
import { BlockNode } from "../types/Node.ts"

import { $output, setError } from "../store/results.ts"
import {
  MachineError,
  MachineState,
  MachineStates,
  MachineStatus,
} from "../types/MachineState.ts"

const rand = () => Math.floor(Math.random() * 500)

type MachineEvent = { Print: { text: string } }

export interface InspectionState {
  stack: number[]
  events: MachineEvent[]

  messages: unknown[]
}

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

const getLogs = (events: MachineEvent[]): string[] =>
  events.filter((e) => "Print" in e).map((e) => e.Print.text)

const toState = (result: InspectionState): MachineState => ({
  error: null,
  stack: result.stack ?? [],
  logs: getLogs(result.events) ?? [],
})

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export class MachineManager {
  ctx: Controller | null = null

  /** How long do we delay, in milliseconds. */
  delayMs = 0

  /** What is the limit on number of cycles? This prevents crashes. */
  maxCycle = 200

  ready = false

  async setup() {
    await setup()
    this.ctx = Controller.create()
  }

  load(id: number, source: string) {
    try {
      this.ctx?.load(id, source)
      setError(id, null)
      this.ready = false
    } catch (error) {
      setError(id, error as MachineError)
    }
  }

  inspect(id: number): InspectionState {
    return this.ctx?.inspect(id)
  }

  get hasParseErrors(): boolean {
    return Object.values($output.get()).some(
      (o) => o.error && "CannotParse" in o.error,
    )
  }

  prepare = () => {
    if (this.ready) return
    this.ctx?.ready()
    this.ready = true
  }

  run = async () => {
    if (this.hasParseErrors) return
    $output.set({})
    this.prepare()

    let cycle = 0

    while (cycle < this.maxCycle && !this.ctx?.is_halted()) {
      this.step()

      // Add an artificial delay to allow the user to see the changes
      if (this.delayMs > 0) await delay(this.delayMs)

      cycle++
    }

    if (cycle >= this.maxCycle && !this.ctx?.is_halted()) {
      this.statuses.forEach((status, id) => {
        if (status !== "Halted") {
          setError(id, { ExecutionCycleExceeded: { id, status } })
        }
      })
    }
  }

  get statuses(): Map<number, MachineStatus> {
    return this.ctx?.statuses()
  }

  step = () => {
    if (this.hasParseErrors) return
    this.prepare()

    try {
      this.ctx?.step()
    } catch (error) {
      const err = error as MachineError

      if ("ExecutionFailed" in err) {
        setError(err.ExecutionFailed.id, err)
      }
    }

    const output = $output.get()

    $nodes.get().forEach((node) => {
      const { id } = node.data
      const events = this.ctx?.consume_events(id)

      const curr = output[id]
      const next = toState({ ...this.inspect(id), events })

      $output.setKey(id, {
        ...next,

        // Preserve logs between steps.
        logs: [...(curr?.logs ?? []), ...next.logs],

        // Preserve parse errors between steps.
        error: curr?.error?.CannotParse ? curr.error : next.error,
      })
    })
  }
}

export const manager = new MachineManager()
await manager.setup()

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.manager = manager
