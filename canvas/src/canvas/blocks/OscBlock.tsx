import { Handle, NodeProps, Position } from "reactflow"

import { OscBlock } from "../../types/blocks"

const S1 = 1

export const OscBlockView = (props: NodeProps<OscBlock>) => {
  const { time = 0, values = [], waveform } = props.data

  return (
    <div>
      <div className="group">
        osc generated: {time}, {values.join(' ')}, {JSON.stringify(waveform)}
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
