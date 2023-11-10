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
import { manager } from "../core"
import { Port } from "machine-wasm"

export const $nodes = atom<BlockNode[]>([])

export const $edges = atom<Edge[]>([])

const port = (id: string, p: string): Port => new Port(Number(id), Number(p))

export const onNodesChange = (changes: NodeChange[]) =>
  $nodes.set(applyNodeChanges(changes, $nodes.get()))

export const onEdgesChange = (changes: EdgeChange[]) =>
  $edges.set(applyEdgeChanges(changes, $edges.get()))

export const onConnect = (conn: Connection) => {
  console.log("on connect...", conn)
  if (!conn.source || !conn.target) return

  manager.ctx?.connect(port(conn.source, "0"), port(conn.target, "0"))
  $edges.set(addEdge(conn, $edges.get()))
}

export function addNode(node: BlockNode) {
  $nodes.set([...$nodes.get(), node])
}
