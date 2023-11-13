import { manager } from "../core"
import { BlockNode } from "../types/Node"

import { isBlock } from "../canvas/blocks"

export function loadFromNodes(nodes: BlockNode[]) {
  for (const node of nodes) {
    if (isBlock.machine(node)) {
      const { id, source } = node.data

      manager.ctx?.add_machine_with_id(id)
      manager.load(id, source)
    }
  }
}
