import { nanoid } from "nanoid"
import { produce } from "immer"
import { Controller } from "machine-wasm"

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
  const id = nanoid(4)

  const machine: Machine = { id, source: "push 5\n\n\n\n" }

  const node: BlockNode = {
    id: id,
    type: "machine",
    data: machine,
    position: { x: rand(), y: rand() },
  }

  addNode(node)
}

export const setSource = (id: string, source: string) => {
  const nodes = produce($nodes.get(), (nodes) => {
    const i = nodes.findIndex((node) => node.id === id)
    nodes[i].data.source = source
  })

  $nodes.set(nodes)
}

const getLogs = (events: MachineEvent[]): string[] => events.filter(e => 'Print' in e).map(e => e.Print.text)

export function runCode(id: string, source: string) {
  const state = $output.get()
  const prev = state[id] ?? {}

  try {
    let result = Controller.run_code(source) as RunResult
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
    runCode(node.id, node.data.source)
  })
}
