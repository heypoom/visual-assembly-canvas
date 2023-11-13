import { Port } from "machine-wasm"

import {
  NodeChange,
  applyNodeChanges,
  EdgeChange,
  applyEdgeChanges,
  Connection,
  addEdge,
} from "reactflow"

import { manager } from "../../core"
import { $nodes, $edges } from "../nodes"

import { BlockNode } from "../../types/Node"

export const port = (id: string, p: string): Port =>
  new Port(Number(id), Number(p))

export const onNodesChange = (changes: NodeChange[]) => {
  const nodes = $nodes.get()

  for (const change of changes) {
    if (change.type === "remove") {
      try {
        const id = parseInt(change.id)
        if (isNaN(id)) continue

        manager.removeBlock(id)
      } catch (error) {
        console.warn("remove block failed:", error)
      }
    }
  }

  $nodes.set(applyNodeChanges(changes, nodes) as BlockNode[])
}

export const onEdgesChange = (changes: EdgeChange[]) => {
  const edges = $edges.get()

  for (const change of changes) {
    if (change.type === "remove") {
      const e = edges.find((e) => e.id === change.id)

      if (!e || !e.sourceHandle || !e.targetHandle) {
        console.warn("cannot remove node", change)
        continue
      }

      try {
        const source = port(e.source, e.sourceHandle)
        const target = port(e.target, e.targetHandle)

        manager.ctx?.disconnect(source, target)
        console.log("port disconnected:", e)
      } catch (err) {
        console.warn("cannot disconnect edge!")
      }
    }
  }

  $edges.set(applyEdgeChanges(changes, edges))
}

export const onConnect = (c: Connection) => {
  console.log("on connect...", c)
  if (!c.source || !c.target || !c.sourceHandle || !c.targetHandle) {
    console.warn("cannot connect as source or target is null!")
    return
  }

  const source = port(c.source, c.sourceHandle)
  const target = port(c.target, c.targetHandle)
  manager.ctx?.connect(source, target)
  $edges.set(addEdge(c, $edges.get()))
}
