import { Handle, Position, NodeProps } from "reactflow"
import cn from "classnames"

import { MachineValueViewer } from "./MachineValueViewer"

import { MachineEditor } from "../../editor/Editor"
import { MachineProps } from "../../types/blocks"
import { useStore } from "@nanostores/react"
import { $output } from "../../store/results"

export function MachineBlock(props: NodeProps<MachineProps>) {
  const { data } = props
  const { id } = data

  const outputs = useStore($output)
  const state = outputs[id] ?? {}

  const errored = state.status === "Invalid"
  const awaiting = state.status === "Awaiting"
  const halted = state.status === "Halted"
  const backpressuring = state.inboxSize > 50
  const sending = state.outboxSize >= 1

  return (
    <div className="font-mono bg-slate-1 relative group">
      <Handle
        type="target"
        position={Position.Left}
        id="5"
        className="bg-crimson-9 group-hover:bg-cyan-11 hover:!bg-gray-12 hover:border-crimson-9 px-1 py-1 ml-[-1px] border-2 z-10"
      ></Handle>

      <div
        className={cn(
          "px-3 py-3 border-2 rounded-2 hover:border-cyan-11",
          errored && "!border-red-9",
          awaiting && "!border-purple-11",
          halted && "border-gray-9",
          backpressuring && "!border-orange-9",
          sending && "border-crimson-11",
        )}
      >
        <div className="flex flex-col space-y-2 text-gray-50">
          <div className="min-h-[100px]">
            <div className="nodrag">
              <MachineEditor {...data} />
            </div>
          </div>

          <MachineValueViewer id={id} state={state} />
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="0"
        className="bg-crimson-9 group-hover:bg-cyan-11 hover:!bg-gray-12 hover:border-crimson-9 px-1 py-1 mr-[-1px] border-2 z-10 mt-[-30px]"
      />

      <Handle
        type="source"
        position={Position.Right}
        id="1"
        className="bg-crimson-9 group-hover:bg-cyan-11 hover:!bg-gray-12 hover:border-crimson-9 px-1 py-1 mr-[-1px] border-2 z-10"
      />

      <Handle
        type="source"
        position={Position.Right}
        id="2"
        className="bg-crimson-9 group-hover:bg-cyan-11 hover:!bg-gray-12 hover:border-crimson-9 px-1 py-1 mr-[-1px] border-2 z-10 mt-[30px]"
      />
    </div>
  )
}
