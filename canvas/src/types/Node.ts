import { Node, NodeProps } from "reactflow"

import { MachineBlock, PixelBlock } from "./blocks"

export interface BlockTypeMap {
  machine: MachineBlock
  pixel: PixelBlock
}

export type BlockTypes = keyof BlockTypeMap
export type BlockValues = BlockTypeMap[BlockTypes]

export type BlockNode = Node<BlockValues>

export type BlockComponentMap = {
  [N in BlockTypes]: (props: NodeProps<BlockTypeMap[N]>) => React.ReactNode
}
