import { manager } from "../machine"
import { BlockNode } from "../types/Node"

export function loadMachinesFromNodes(nodes: BlockNode[]) {
  for (const node of nodes) {
    const { id, source } = node.data

    manager.ctx?.add_with_id(id)
    manager.load(id, source)
  }
}
