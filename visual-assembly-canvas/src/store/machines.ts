import { produce } from "immer"
import setup, { Controller } from "machine-wasm"

import { $nodes, addNode } from "./nodes"

import { Machine } from "../types/Machine"
import { BlockNode } from "../types/Node"

import { $output } from "./results"

const rand = () => Math.floor(Math.random() * 500)

type MachineEvent = {Print: {text: string}}

export interface RunResult {
  stack: number[],
  events: MachineEvent[]
}

export function addMachine() {
  const id = manager.add();
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

const getLogs = (events: MachineEvent[]): string[] => events.filter(e => 'Print' in e).map(e => e.Print.text)

export class MachineManager {
  ctrl: Controller | null = null

  async setup() {
    await setup()
    this.ctrl = Controller.create()
    console.log('wasm ready!')
  }

  add() {
    return this.ctrl?.add()
  }

  run(id: number, source: string): RunResult {
    return this.ctrl?.run(id, source)
  }
}

export const manager = new MachineManager()
await manager.setup()
window.manager = manager

export function runCode(id: number, source: string) {
  const state = $output.get()
  const prev = state[id] ?? {}

  try {
    let result = manager.run(id, source) as RunResult
    console.log(result)

    $output.setKey(id, {
      error: null,
      stack: result.stack ?? [],
      logs: getLogs(result.events) ?? [],
    })
  } catch (err) {
    if (err instanceof Error) {
      console.log('run code error:', err)

      $output.setKey(id, {
        ...prev,
        error: err,
      })
    }
  }
}

export function runAll() {
  $nodes.get().forEach((node) => {
    runCode(node.data.id, node.data.source)
  })
}
