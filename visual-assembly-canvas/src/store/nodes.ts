import {atom} from 'nanostores'

import {
  Node,
  Edge,
  addEdge,
  NodeChange,
  EdgeChange,
  Connection,
  applyEdgeChanges,
  applyNodeChanges,
} from 'reactflow'

import {initialEdges, initialNodes} from './initial-nodes'

import {BlockNode} from '../types/Node'

export const $nodes = atom<BlockNode[]>(initialNodes)
export const $edges = atom<Edge[]>(initialEdges)

export const onNodesChange = (changes: NodeChange[]) =>
  $nodes.set(applyNodeChanges(changes, $nodes.get()))

export const onEdgesChange = (changes: EdgeChange[]) =>
  $edges.set(applyEdgeChanges(changes, $edges.get()))

export const onConnect = (connection: Connection) =>
  $edges.set(addEdge(connection, $edges.get()))

export function addNode(node: BlockNode) {
  $nodes.set([...$nodes.get(), node])
}
