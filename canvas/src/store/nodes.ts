import { persistentAtom as atom } from "@nanostores/persistent"

import {
  Edge,
  addEdge,
  NodeChange,
  EdgeChange,
  Connection,
  applyEdgeChanges,
  applyNodeChanges,
} from "reactflow"

import { BlockNode } from "../types/Node"
import { loadMachinesFromNodes } from "./persist"

// Serializer
const S = {
  encode: JSON.stringify,
  decode: JSON.parse,
}

export const $nodes = atom<BlockNode[]>("nodes", [], {
  ...S,
  decode(s) {
    const nodes = JSON.parse(s) as BlockNode[]
    loadMachinesFromNodes(nodes)

    return nodes
  },
})

export const $edges = atom<Edge[]>("edges", [], S)

export const onNodesChange = (changes: NodeChange[]) =>
  $nodes.set(applyNodeChanges(changes, $nodes.get()))

export const onEdgesChange = (changes: EdgeChange[]) =>
  $edges.set(applyEdgeChanges(changes, $edges.get()))

export const onConnect = (connection: Connection) =>
  $edges.set(addEdge(connection, $edges.get()))

export function addNode(node: BlockNode) {
  $nodes.set([...$nodes.get(), node])
}
