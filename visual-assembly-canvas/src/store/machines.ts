import { produce } from "immer"
import setup, { Controller } from "machine-wasm"

import { $nodes, addNode } from "./nodes"

import { Machine } from "../types/Machine"
import { BlockNode } from "../types/Node"

import { $output } from "./results"
import { MachineState } from "../types/MachineState.ts"

const rand = () => Math.floor(Math.random() * 500)

type MachineEvent = { Print: { text: string } }

export interface RunResult {
  stack: number[]
  events: MachineEvent[]
}

export function addMachine() {
  const id = manager.ctrl?.add()
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

const toState = (result: RunResult): MachineState => ({
  error: null,
  stack: result.stack ?? [],
  logs: getLogs(result.events) ?? [],
})

export class MachineManager {
  ctrl: Controller | null = null

  async setup() {
    await setup()
    this.ctrl = Controller.create()
    console.log("wasm ready!")
  }

  load(id: number, source: string) {
    this.ctrl?.load(id, source)
  }

  run(id: number, source: string) {
    const state = $output.get()
    const prev = state[id] ?? {}

    try {
      const result = this.ctrl.run(id, source)

      $output.setKey(id, toState(result))
    } catch (err) {
      if (err instanceof Error) {
        console.log("run code error:", err)

        $output.setKey(id, {
          ...prev,
          error: err,
        })
      }
    }
  }

  runAll = () => {
    $nodes.get().forEach((node) => {
      this.run(node.data.id, node.data.source)
    })
  }

  stepAll = () => {
    this.ctrl?.step_all()

    const prevs = $output.get()

    $nodes.get().forEach((node) => {
      const { id } = node.data
      const prev = prevs[id]

      $output.setKey(id, {
        ...prev,
        stack: this.ctrl?.read_stack(id, 10) ?? [],
        logs: getLogs(this.ctrl?.read_events(id)),
      })
    })
  }
}

export const manager = new MachineManager()
await manager.setup()

// @ts-ignore
window.manager = manager
