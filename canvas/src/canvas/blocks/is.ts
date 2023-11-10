import { Node } from "reactflow"

import { MachineBlock } from "../../types/blocks"
import { BlockNode } from "../../types/Node"

export const isMachineNode = (node: BlockNode): node is Node<MachineBlock> =>
  node.type === "machine"
