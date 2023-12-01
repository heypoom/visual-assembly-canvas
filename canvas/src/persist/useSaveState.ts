import { useReactFlow } from "reactflow"

import { SaveState } from "./types"
import { setupBlock } from "./setupBlock"

import { engine } from "../engine"
import { BlockNode } from "../types/Node"
import { $clock } from "../store/clock"

export interface SaveStateContext {
  serialize: () => SaveState
  restore: (state: SaveState) => void
  clear: () => void
}

export function useSaveState(): SaveStateContext {
  const flow = useReactFlow()

  const serialize = (): SaveState => ({
    flow: flow.toObject(),
    engine: engine.ctx?.partial_serialize_canvas_state(),
    clock: $clock.get(),
  })

  function restore(state: SaveState) {
    if (!state.flow || !state.engine) return

    // Restore engine state
    engine.ctx?.load_canvas_state(state.engine)

    // Restore nodes and edges
    const { nodes, edges, viewport } = state.flow
    flow.setNodes(nodes)
    flow.setEdges(edges)

    // Restore viewport
    const { x = 0, y = 0, zoom = 1 } = viewport
    flow.setViewport({ x, y, zoom })

    // Restore clock configuration.
    $clock.set(state.clock)
    engine.setInstructionsPerTick(state.clock.instructionsPerTick)

    // Re-initialize the blocks
    nodes.forEach((node) => setupBlock(node as BlockNode))

    // Reset the machines.
    engine.reset()
  }

  function clear() {
    flow.setEdges([])
    flow.setNodes([])
    engine.ctx?.clear()
  }

  return { serialize, restore, clear }
}
