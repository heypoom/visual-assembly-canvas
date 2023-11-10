import { Handle, Position, NodeProps } from "reactflow"

import { MachineValueViewer } from "./MachineValueViewer"

import { MachineBlock } from "../../../types/blocks"
import { MachineEditor } from "../../../editor/Editor"

export function MachineBlockView(props: NodeProps<MachineBlock>) {
  const { data } = props

  return (
    <div className="font-mono bg-slate-1 relative">
      <Handle
        type="target"
        position={Position.Left}
        id="0"
        className="bg-crimson-9 px-1 py-1 ml-[-1px] border-2"
      ></Handle>

      <div className="px-3 py-3 border-2 rounded-2">
        <div className="flex flex-col space-y-2 text-gray-50">
          <div className="min-h-[100px]">
            <div className="nodrag">
              <MachineEditor {...data} />
            </div>
          </div>

          <MachineValueViewer id={data.id} />
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="1"
        className="bg-crimson-9 px-1 py-1 mr-[-1px] border-2"
      />
    </div>
  )
}
