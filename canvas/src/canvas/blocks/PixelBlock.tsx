import { Handle, Position } from "reactflow"

export const PixelBlockView = () => {
  return (
    <div className="">
      <Handle type="source" position={Position.Left} id="ls" />

      <div className="px-3 py-3 border rounded-2">ok</div>

      <Handle type="source" position={Position.Right} id="rt" />
    </div>
  )
}
