import ReactFlow from "reactflow"

import { useStore } from "@nanostores/react"

import "reactflow/dist/style.css"

import {
  $edges,
  $nodes,
  onConnect,
  onEdgesChange,
  onNodesChange,
} from "../store/nodes"

import { nodeTypes } from "./blocks"

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
