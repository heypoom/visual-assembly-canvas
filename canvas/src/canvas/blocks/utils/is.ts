import { BlockNode, BlockTypes, TNode } from "../../../types/Node"

export const isBlockType =
  <T extends BlockTypes>(key: T) =>
  (node: BlockNode): node is TNode<T> =>
    node.type === key

export const isBlock = {
  machine: isBlockType("Machine"),
  pixel: isBlockType("Pixel"),
  tap: isBlockType("Tap"),
  osc: isBlockType("Osc"),
  plot: isBlockType("Plot"),
}
