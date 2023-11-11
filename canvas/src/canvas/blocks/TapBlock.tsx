import { Handle, Position } from "reactflow"

// TODO: send message to connected port on tap
// TODO: add ways for blocks to send events from the frontend
export const TapBlockView = () => {
  return (
    <div>
      <div>
        <Handle
          type="target"
          position={Position.Left}
          id="0"
          className="bg-crimson-9 group-hover:bg-cyan-11 hover:!bg-gray-12 hover:border-crimson-9 px-1 py-1 ml-[-1px] border-2 z-10"
        />

        <div>
          <div className="w-20 h-20 rounded-6 bg-gray-1" />
          <div>Tap Block</div>
        </div>
      </div>
    </div>
  )
}
