import { nanoid } from "nanoid"
import { produce } from "immer"
import { load_machine } from "machine-wasm"

import { $nodes, addNode } from "./nodes"

import { Machine } from "../types/Machine"
import { BlockNode } from "../types/Node"
import { $errors, $outputs } from "./results.ts"

const rand = () => Math.floor(Math.random() * 500)

export function addMachine() {
  const id = nanoid(4)

  const machine: Machine = { id, source: "push 5" }

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

export function runCode(id: string, source: string) {
  try {
    const out = load_machine(source)
    $outputs.setKey(id, out)
    $errors.setKey(id, null)
  } catch (err) {
    if (err instanceof Error) {
      $outputs.setKey(id, null)
      $errors.setKey(id, err)
    }
  }
}

export function runAll() {
  $nodes.get().forEach((node) => {
    runCode(node.id, node.data.source)
  })
}
