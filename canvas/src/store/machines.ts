import { produce } from "immer"
import setup, { Controller } from "machine-wasm"

import { $nodes, addNode } from "./nodes"

import { Machine } from "../types/Machine"
import { BlockNode } from "../types/Node"

import { $output } from "./results"
import { MachineState } from "../types/MachineState.ts"

const rand = () => Math.floor(Math.random() * 500)

type MachineEvent = { Print: { text: string } }

const MAX_CYCLE = 1000

export interface InspectionState {
  stack: number[]
  events: MachineEvent[]
  messages: any[]
}

export function addMachine() {
  const id = manager.core?.add()
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
  core: Controller | null = null

  // How long do we delay, in milliseconds.
  delayMs = 800

  async setup() {
    await setup()
    this.core = Controller.create()
    console.log("wasm ready!")
  }

  load(id: number, source: string) {
    this.core?.load(id, source)
  }

  inspect(id: number): InspectionState {
    return this.core?.inspect(id)
  }

  run = async () => {
    let cycle = 0

    this.core?.ready()

    while (cycle < MAX_CYCLE && !this.core?.is_halted()) {
      this.step()
      console.log("> stepping...")

      // Add an artificial delay to allow the user to see the changes
      if (this.delayMs > 0) await delay(this.delayMs)

      cycle++
    }
  }

  step = () => {
    this.core?.step()

    const prevs = $output.get()

    $nodes.get().forEach((node) => {
      const { id } = node.data
      const prev = prevs[id]

      $output.setKey(id, {
        ...prev,
        ...toState(this.inspect(id)),
      })
    })
  }
}

export const manager = new MachineManager()
await manager.setup()

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.manager = manager
