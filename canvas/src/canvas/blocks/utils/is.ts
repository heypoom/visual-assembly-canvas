import { Node } from "reactflow"

import { MachineBlock, PixelBlock, TapBlock } from "../../../types/blocks"
import { BlockNode } from "../../../types/Node"

export const isMachineNode = (node: BlockNode): node is Node<MachineBlock> =>
  node.type === "machine"

export const isPixelNode = (node: BlockNode): node is Node<PixelBlock> =>
  node.type === "pixel"

export const isTapNode = (node: BlockNode): node is Node<TapBlock> =>
  node.type === "tap"
