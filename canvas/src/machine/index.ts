import { produce } from "immer"
import setup, { Controller } from "machine-wasm"

import { $nodes, addNode } from "../store/nodes.ts"

import { Machine } from "../types/Machine.ts"
import { BlockNode } from "../types/Node.ts"

import { $output } from "../store/results.ts"
import { MachineState } from "../types/MachineState.ts"

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

  async setup() {
    await setup()
    this.ctx = Controller.create()
  }

  load(id: number, source: string) {
    this.ctx?.load(id, source)
  }

  inspect(id: number): InspectionState {
    return this.ctx?.inspect(id)
  }

  run = async () => {
    this.ctx?.ready()
    $output.set({})

    let cycle = 0

    while (cycle < this.maxCycle && !this.ctx?.is_halted()) {
      this.step()

      // Add an artificial delay to allow the user to see the changes
      if (this.delayMs > 0) await delay(this.delayMs)

      cycle++
    }

    if (cycle >= this.maxCycle && !this.ctx?.is_halted()) {
      console.warn("Machine did not halt within cycle limit!")
    }
  }

  step = () => {
    this.ctx?.step()

    const output = $output.get()

    $nodes.get().forEach((node) => {
      const { id } = node.data
      const events = this.ctx?.consume_events(id)

      const prev = output[id]
      const state = toState({ ...this.inspect(id), events })

      $output.setKey(id, {
        ...state,
        logs: [...(prev?.logs ?? []), ...state.logs],
      })
    })
  }
}

export const manager = new MachineManager()
await manager.setup()

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.manager = manager
