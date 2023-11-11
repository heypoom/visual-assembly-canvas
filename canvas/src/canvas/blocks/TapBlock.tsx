import { Handle, NodeProps, Position } from "reactflow"
import { manager } from "../../core"
import { Port } from "machine-wasm"
import { TapBlock } from "../../types/blocks"

const S1 = 1

// TODO: send message to connected port on tap
// TODO: add ways for blocks to send events from the frontend
export const TapBlockView = (props: NodeProps<TapBlock>) => {
  const { id } = props.data

  function tap() {
    try {
      manager.ctx?.send_message({
        port: new Port(id, S1),
        action: { Data: { body: [1] } },
      })
    } catch (err) {
      console.warn("cannot send tap:", err)
    }

    manager.step()
  }

  return (
    <div className="group">
      <div>
        <div className="rounded-1 px-3 py-2 bg-gray-5 border-2 border-gray-8 hover:border-cyan-9 flex items-center justify-center">
          <button
            className="w-5 h-5 rounded-[100%] bg-cyan-11 hover:bg-cyan-9 border-2 border-gray-12"
            onClick={tap}
          />
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id={S1.toString()}
        className="bg-crimson-9 group-hover:bg-cyan-11 hover:!bg-gray-12 hover:border-crimson-9 px-1 py-1 ml-[-1px] border-2 z-10"
      />
    </div>
  )
}
