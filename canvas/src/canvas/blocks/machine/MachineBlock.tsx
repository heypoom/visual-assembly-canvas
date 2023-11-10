import { Handle, Position, NodeProps } from "reactflow"

import { MachineValueViewer } from "./MachineValueViewer"

import { MachineBlock } from "../../../types/blocks"
import { MachineEditor } from "../../../editor/Editor"

export function MachineBlockView(props: NodeProps<MachineBlock>) {
  const { data } = props

  return (
    <div className="font-mono bg-slate-1">
      <Handle type="target" position={Position.Left} id="T1" />
      <Handle type="target" position={Position.Left} id="T2 " />

      <div className="px-3 py-3 border rounded-2">
        <div className="flex flex-col space-y-2 text-gray-50">
          <div className="min-h-[100px]">
            <div className="nodrag">
              <MachineEditor {...data} />
            </div>
          </div>

          <MachineValueViewer id={data.id} />
        </div>
      </div>

      <Handle type="source" position={Position.Right} id="S1" />
      <Handle type="source" position={Position.Right} id="S2" />
    </div>
  )
}
