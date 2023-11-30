import { Handle, NodeProps, Position } from "reactflow"

import { SynthProps } from "../types/blocks"

const S0 = 0
const S1 = 1

export const SynthBlock = (props: NodeProps<SynthProps>) => {
  const { config } = props.data ?? {}
  const name = typeof config === "string" ? config : Object.keys(config)?.[0]

  return (
    <div>
      <Handle
        type="target"
        position={Position.Left}
        id={S0.toString()}
        className="bg-cyan-9 group-hover:bg-cyan-11 hover:!bg-gray-12 hover:border-cyan-9 px-1 py-1 ml-[-1px] border-2 z-10"
      />

      <div className="px-4 py-2 border-2 rounded-2">
        <div>{name} Synth</div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id={S1.toString()}
        className="bg-cyan-9 group-hover:bg-cyan-11 hover:!bg-gray-12 hover:border-cyan-9 px-1 py-1 ml-[-1px] border-2 z-10"
      />
    </div>
  )
}
