import { $nodes } from "../nodes"

import { BlockNode } from "../../types/Node"

export function addNode(node: BlockNode) {
  $nodes.set([...$nodes.get(), node])
}
