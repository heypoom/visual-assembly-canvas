import { useReactFlow } from "reactflow"

import { SaveState } from "./types"
import { setupBlock } from "./setupBlock"

import { engine } from "../engine"
import { BlockNode } from "../types/Node"
import { $clock } from "../store/clock"
import { defaultProps } from "../blocks"
import { port } from "../store/actions/changes"

export interface SaveStateContext {
  serialize: () => SaveState
  restore: (state: SaveState) => void
  clear: () => void
}

export function useSaveState(): SaveStateContext {
  const flow = useReactFlow()

  const serialize = (): SaveState => {
    return {
      flow: flow.toObject(),
      clock: $clock.get(),
      counters: engine.getIdCounters(),
    }
  }

  function restore(state: SaveState) {
    if (!state.flow) return

    console.log("--- restoring ---")

    // Restore nodes and edges
    const { nodes, edges, viewport } = state.flow
    flow.setNodes(nodes)
    flow.setEdges(edges)

    // Restore viewport
    const { x = 0, y = 0, zoom = 1 } = viewport
    flow.setViewport({ x, y, zoom })

    // Reset the entire engine's instance.
    engine.ctx?.clear()

    // Restore clock configuration.
    $clock.set(state.clock)
    engine.setInstructionsPerTick(state.clock.instructionsPerTick)

    // Add the blocks to the engine.
    for (const node of nodes) {
      try {
        const block = node as BlockNode

        const { type } = block
        const { id, ...nodeProps } = block.data
        console.log(`block id (${type}) = ${id}`)

        if (type === undefined) {
          console.warn("node type is missing!", block)
          return
        }

        if (type === "Machine") {
          engine.ctx?.add_machine_with_id(id)
        } else {
          const props = { ...defaultProps[type], ...nodeProps }

          engine.ctx?.add_block_with_id(id, { [type]: props })
        }

        setupBlock(block)
      } catch (error) {
        console.warn("unable to restore node", error, { node })
      }
    }

    // Add the wires.
    // TODO: make the wire ID idempotent across saves!
    edges.forEach((edge, id) => {
      if (!edge.sourceHandle || !edge.targetHandle) return

      const source = port(edge.source, edge.sourceHandle)
      const target = port(edge.target, edge.targetHandle)

      engine.ctx?.add_wire_with_id(id, source, target)
    })

    // Apply the ID counters.
    // TODO: make the wire ID idempotent across saves!
    const [blockCounter] = state.counters
    engine.ctx?.set_id_counters(blockCounter, edges.length)

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
