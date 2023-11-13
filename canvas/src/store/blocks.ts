import { action } from "nanostores"
import { produce, Draft } from "immer"

import { $nodes } from "./nodes"
import { BlockNode, BlockValues } from "../types/Node"

type Updater = (node: Draft<BlockNode>) => void

export const updateNode = action(
  $nodes,
  "update node",
  (nodes, id: number, update: Updater) => {
    const next = produce(nodes.get(), (nodes) => {
      const node = nodes.find((n) => n.data.id === id)

      if (!node) {
        console.warn(`node not found for block "${id}" when updating.`)
        return
      }

      update(node)
    })

    nodes.set(next)
  },
)

export const updateNodeData = <K extends BlockValues>(
  id: number,
  data: Partial<K>,
) =>
  updateNode(id, (v) => {
    v.data = { ...v.data, ...data }
  })
