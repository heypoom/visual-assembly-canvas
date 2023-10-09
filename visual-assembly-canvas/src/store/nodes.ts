import {atom} from 'nanostores'
import {Node} from 'reactflow'

export const $nodes = atom<Node[]>([])

export function addNode(node: Node) {
  $nodes.set([...$nodes.get(), node])
}
