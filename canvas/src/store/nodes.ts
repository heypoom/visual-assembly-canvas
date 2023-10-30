import { atom } from "nanostores"

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

export const $nodes = atom<BlockNode[]>([])
export const $edges = atom<Edge[]>([])

export const onNodesChange = (changes: NodeChange[]) =>
  $nodes.set(applyNodeChanges(changes, $nodes.get()))

export const onEdgesChange = (changes: EdgeChange[]) =>
  $edges.set(applyEdgeChanges(changes, $edges.get()))

export const onConnect = (connection: Connection) =>
  $edges.set(addEdge(connection, $edges.get()))

export function addNode(node: BlockNode) {
  $nodes.set([...$nodes.get(), node])
}
