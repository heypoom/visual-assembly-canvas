import { Node, NodeProps } from "reactflow"

import { MachineBlock, PixelArtBlock } from "./blocks"

export interface NodeTypeMap {
  machine: MachineBlock
}

export type NodeTypes = keyof NodeTypeMap
export type NodeTypeValues = NodeTypeMap[NodeTypes]

export type BlockNode = Node<MachineBlock | PixelArtBlock>

export type NodeComponentMap = {
  [N in NodeTypes]: (props: NodeProps<NodeTypeMap[N]>) => JSX.Element
}
