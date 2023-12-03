import "reactflow/dist/style.css"

import { useStore } from "@nanostores/react"
import ReactFlow from "reactflow"

import { nodeTypes } from "@/blocks"
import {
  onConnect,
  onEdgesChange,
  onNodesChange,
} from "@/store/actions/changes"
import { $edges, $nodes } from "@/store/nodes"

export const Canvas = () => {
  const nodes = useStore($nodes)
  const edges = useStore($edges)

  return (
    <div className="h-screen min-w-full w-screen">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onConnect={onConnect}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        proOptions={{ hideAttribution: true }}
      />
    </div>
  )
}
