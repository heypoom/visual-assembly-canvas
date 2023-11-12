import { Node } from "reactflow"

import { BlockNode } from "../../../types/Node"
import { MachineBlock, OscBlock, PixelBlock, PlotterBlock, TapBlock } from "../../../types/blocks"

export const isMachineNode = (node: BlockNode): node is Node<MachineBlock> =>
  node.type === "machine"

export const isPixelNode = (node: BlockNode): node is Node<PixelBlock> =>
  node.type === "pixel"

export const isTapNode = (node: BlockNode): node is Node<TapBlock> =>
  node.type === "tap"

export const isOscNode = (node: BlockNode): node is Node<OscBlock> =>
  node.type === "osc"

export const isPlotterNode = (node: BlockNode): node is Node<PlotterBlock> =>
  node.type === "plotter"
