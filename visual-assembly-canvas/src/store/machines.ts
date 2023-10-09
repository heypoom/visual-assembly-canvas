import {nanoid} from 'nanoid'
import {produce} from 'immer'

import {$nodes, addNode} from './nodes'

import {Machine} from '../types/Machine'
import {BlockNode} from '../types/Node'

const rand = () => Math.floor(Math.random() * 500)

export function addMachine() {
  const id = nanoid(4)

  const machine: Machine = {id, source: 'push 5'}

  const node: BlockNode = {
    id: `M${id}`,
    type: 'machine',
    data: machine,
    position: {x: rand(), y: rand()},
  }

  addNode(node)
}

export const setSource = (id: string, source: string) => {
  const nodes = produce($nodes.get(), (nodes) => {
    const i = nodes.findIndex((node) => node.id === id)
    nodes[i].data.source = source
  })

  $nodes.set(nodes)
}
