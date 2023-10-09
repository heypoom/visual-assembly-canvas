import {Edge} from 'reactflow'
import {BlockNode} from '../types/Node'

export const initialNodes: BlockNode[] = [
  {
    id: 'M1',
    position: {x: 100, y: 100},
    type: 'machine',
    data: {id: 'M1', source: 'push 0xAA'},
  },
]

export const initialEdges: Edge[] = []
