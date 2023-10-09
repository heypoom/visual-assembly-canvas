import ReactFlow, {
  Node,
  Edge,
  addEdge,
  useEdgesState,
  useNodesState,
  OnConnect,
} from 'reactflow'

import {Button} from '@radix-ui/themes'
import {useStore} from '@nanostores/react'

import 'reactflow/dist/style.css'
import {useCallback, useMemo} from 'react'
import {MachineBlock} from './blocks/MachineBlock'

const initialNodes: Node[] = [
  {
    id: 'M1',
    position: {x: 100, y: 100},
    data: {label: 'Machine A'},
    type: 'machine',
  },

  {
    id: 'M2',
    position: {x: 100, y: 400},
    data: {label: 'Machine B'},
    type: 'machine',
  },
]

const initialEdges: Edge[] = [
  {
    id: 'wire',
    source: 'M1',
    target: 'M2',
  },
]

export const Canvas = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const nodeTypes = useMemo(() => ({machine: MachineBlock}), [])

  return (
    <div className="h-screen min-w-full w-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onConnect={onConnect}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        proOptions={{hideAttribution: true}}
      />
    </div>
  )
}
