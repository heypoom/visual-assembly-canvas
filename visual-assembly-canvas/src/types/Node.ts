import {Node, NodeProps} from 'reactflow'

import {Machine} from './Machine'

export interface NodeTypeMap {
  machine: Machine
}

export type NodeTypes = keyof NodeTypeMap
export type NodeTypeValues = NodeTypeMap[NodeTypes]

export type BlockNode = Node<Machine>

export type NodeComponentMap = {
  [N in NodeTypes]: (props: NodeProps<NodeTypeMap[N]>) => JSX.Element
}
