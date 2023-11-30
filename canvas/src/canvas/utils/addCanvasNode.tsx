import { getCenterWithOffset } from "./center"

import { addNode } from "../../store/actions/nodes"
import { BlockNode, BlockTypeMap, BlockTypes } from "../../types/Node"

export function addCanvasNode<T extends BlockTypes>(
  id: number,
  type: T,
  data: BlockTypeMap[T],
) {
  const center = getCenterWithOffset()

  const node: BlockNode = {
    id: id.toString(),
    type,
    data,
    position: center,
  }

  addNode(node)

  return node
}
