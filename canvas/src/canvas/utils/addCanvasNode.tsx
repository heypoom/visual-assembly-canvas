import { addNode } from "../../store/nodes"
import { BlockNode, BlockTypeMap, BlockTypes } from "../../types/Node"

export function addCanvasNode<T extends BlockTypes>(
  id: number,
  type: T,
  data: BlockTypeMap[T],
) {
  const node: BlockNode = {
    id: id.toString(),
    type,
    data,
    position: { x: rand(), y: rand() },
  }

  addNode(node)
}

const rand = () => Math.floor(Math.random() * 500)
