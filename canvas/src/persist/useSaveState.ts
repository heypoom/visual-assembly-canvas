import { useReactFlow } from "reactflow"

import { SaveState } from "./types"
import { setupBlock } from "./setupBlock"

import { engine } from "../engine"
import { BlockNode } from "../types/Node"

export function useSaveState() {
  const flow = useReactFlow()

  const serialize = (): SaveState => ({
    flow: flow.toObject(),
    engine: engine.ctx?.partial_serialize_canvas_state(),
  })

  function restore(state: SaveState) {
    if (!state.flow || !state.engine) return

    // Restore engine state
    engine.ctx?.load_canvas_state(state.engine)

    // Restore nodes and edges
    const { nodes, edges, viewport } = state.flow
    flow.setNodes(nodes)
    flow.setEdges(edges)

    const { x = 0, y = 0, zoom = 1 } = viewport
    flow.setViewport({ x, y, zoom })

    // Re-initialize the blocks
    nodes.forEach((node) => setupBlock(node as BlockNode))
  }

  function clear() {
    flow.setEdges([])
    flow.setNodes([])
    engine.ctx?.clear()
  }

  return { serialize, restore, clear }
}
