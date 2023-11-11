import { Node, NodeProps } from "reactflow"

import { MachineBlock, PixelBlock, TapBlock } from "./blocks"

export interface BlockTypeMap {
  machine: MachineBlock
  pixel: PixelBlock
  tap: TapBlock
}

export type BlockTypes = keyof BlockTypeMap
export type BlockValues = BlockTypeMap[BlockTypes]

export type BlockNode = Node<BlockValues>

export type BlockComponentMap = {
  [N in BlockTypes]: (props: NodeProps<BlockTypeMap[N]>) => React.ReactNode
}
