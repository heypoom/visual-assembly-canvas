import { BlockNode, BlockTypeMap, BlockTypes } from "@/types/Node"

import { addNode } from "../../store/actions/nodes"
import { getCenterWithOffset } from "./center"

interface Options {
  position?: { x: number; y: number }
}

export function addCanvasNode<T extends BlockTypes>(
  id: number,
  type: T,
  data: BlockTypeMap[T],
  options?: Options,
) {
  const { position = getCenterWithOffset() } = options ?? {}

  const node: BlockNode = {
    id: id.toString(),
    type,
    data,
    position,
  }

  addNode(node)

  return node
}
