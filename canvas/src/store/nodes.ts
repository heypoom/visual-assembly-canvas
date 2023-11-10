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

export const onEdgesChange = (changes: EdgeChange[]) => {
  const edges = $edges.get()

  for (const change of changes) {
    if (change.type === "remove") {
      const edge = edges.find((e) => e.id === change.id)
      if (!edge) continue

      try {
        // TODO: map handle to port ids -> edge.sourceHandle, edge.targetHandle
        manager.ctx?.disconnect(port(edge.source, "0"), port(edge.target, "0"))
        console.log("port disconnected:", edge)
      } catch (err) {
        console.warn("cannot disconnect edge!")
      }
    }
  }

  $edges.set(applyEdgeChanges(changes, edges))
}

export const onConnect = (conn: Connection) => {
  console.log("on connect...", conn)
  if (!conn.source || !conn.target) return

  // TODO: map handle to port ids -> conn.sourceHandle, conn.targetHandle
  manager.ctx?.connect(port(conn.source, "0"), port(conn.target, "0"))
  $edges.set(addEdge(conn, $edges.get()))
}

export function addNode(node: BlockNode) {
  $nodes.set([...$nodes.get(), node])
}
