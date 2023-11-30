import { useEffect, useRef } from "react"
import { ReactFlowJsonObject, useReactFlow } from "reactflow"

import { LocalStorageDriver } from "./localStorage"

import { engine } from "../engine"
import { BlockNode, BlockValues } from "../types/Node"

import { setupBlock } from "./setupBlock"

export interface SaveState {
  flow: ReactFlowJsonObject<BlockValues>
  engine: any
}

export interface PersistenceDriver {
  save: (serialize: () => SaveState) => void
  load: (restore: (state: SaveState) => void) => void
}

interface Config {
  driver?: PersistenceDriver
}

export function usePersist(config: Config = {}) {
  const { driver = LocalStorageDriver } = config

  const done = useRef<boolean>()
  const flow = useReactFlow()

  const serialize = (): SaveState => {
    return {
      flow: flow.toObject(),
      engine: engine.ctx?.serialize_canvas_state(),
    }
  }

  function restore(state: SaveState) {
    if (!state.flow || !state.engine) return

    // Restore engine state
    engine.ctx?.load_canvas_state(state.engine)

    // Restore nodes and edges
    const { nodes, edges, viewport } = state.flow
    flow.setNodes(nodes)
    flow.setEdges(edges)
    flow.setViewport(viewport)

    // Re-initialize the blocks
    nodes.forEach((node) => setupBlock(node as BlockNode))
  }

  function clear() {
    flow.setEdges([])
    flow.setNodes([])
    engine.ctx?.clear()
  }

  const storage = {
    save: () => driver.save(serialize),
    load: () => driver.load(restore),
  }

  // Load saved state on first render
  useEffect(() => {
    if (done.current) return

    setTimeout(() => {
      storage.load()
    }, 0)

    done.current = true
    window.persist = { storage, serialize, restore, clear }
  }, [])

  return { storage, serialize, restore, clear }
}
