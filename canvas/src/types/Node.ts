import { Node, NodeProps } from "reactflow"

import {
  MachineBlock,
  OscBlock,
  PixelBlock,
  PlotterBlock,
  TapBlock,
} from "./blocks"

export interface BlockTypeMap {
  MachineBlock: MachineBlock
  PixelBlock: PixelBlock
  TapBlock: TapBlock
  PlotterBlock: PlotterBlock
  OscBlock: OscBlock
}

export type BlockTypes = keyof BlockTypeMap
export type BlockValues = BlockTypeMap[BlockTypes]

export type BlockNode = Node<BlockValues, BlockTypes>
export type TNode<T extends BlockTypes> = Node<BlockTypeMap[T], T>

export type BlockComponentMap = {
  [N in BlockTypes]: (props: NodeProps<BlockTypeMap[N]>) => React.ReactNode
}
