import { Handle, NodeProps, Position } from "reactflow"

import { PlotterBlock } from "../../types/blocks"

const S0 = 0

export const PlotterBlockView = (props: NodeProps<PlotterBlock>) => {
  const { data } = props.data

  return (
    <div>
      <Handle
        type="target"
        position={Position.Left}
        id={S0.toString()}
        className="bg-crimson-9 group-hover:bg-cyan-11 hover:!bg-gray-12 hover:border-crimson-9 px-1 py-1 ml-[-1px] border-2 z-10"
      />

      <div className="group">
        Plotter received data: {data.join(" ")}
      </div>
    </div>
  )
}
