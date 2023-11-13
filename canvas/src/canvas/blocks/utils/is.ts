import { BlockNode, BlockTypes, TNode } from "../../../types/Node"

export const isBlockType =
  <T extends BlockTypes>(key: T) =>
  (node: BlockNode): node is TNode<T> =>
    node.type === key

export const isBlock = {
  machine: isBlockType("MachineBlock"),
  pixel: isBlockType("PixelBlock"),
  tap: isBlockType("TapBlock"),
  osc: isBlockType("OscBlock"),
  plotter: isBlockType("PlotterBlock"),
}
