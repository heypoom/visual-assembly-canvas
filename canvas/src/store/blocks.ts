import { Draft, produce } from "immer"

import { isBlock } from "@/blocks"
import { BlockNode, BlockValues } from "@/types/Node"

import { $nodes } from "./nodes"
import { BlockDataByType } from "machine-wasm"

type Updater = (node: Draft<BlockNode>) => void

export const updateNode = (id: number, update: Updater) => {
  const next = produce($nodes.get(), (nodes) => {
    const node = nodes.find((n) => n.data.id === id)

    if (!node) {
      console.warn(`node not found for block "${id}" when updating.`)
      return
    }

    update(node)
  })

  $nodes.set(next)
}

export const updateNodeData = <K extends BlockValues>(
  id: number,
  data: Partial<K>,
) =>
  updateNode(id, (v) => {
    v.data = { ...v.data, ...data }
  })

/** Sync the block data from the engine. */
export const syncBlockData = (block: { id: number; data: BlockDataByType }) => {
  console.log("syncBlockData", block.data)

  updateNode(block.id, (node) => {
    const type = node.type

    if (type) {
      if (block.data.type === "BuiltIn") {
        node.data = { ...node.data, ...block.data.data }
      } else {
        console.log("external block", block)
        // node.data = { ...node.data, ...block.data.data }
      }
    }
  })
}

export const setSource = (id: number, source: string) => {
  updateNode(id, (node) => {
    if (isBlock.machine(node)) node.data.source = source
  })
}
