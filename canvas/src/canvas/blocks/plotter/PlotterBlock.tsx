import { Handle, NodeProps, Position } from "reactflow"

import { PlotterBlock } from "../../../types/blocks"
import { useReducer } from "react"
import { RightClickMenu } from "../../components/RightClickMenu"
import { rescale } from "./rescale"

const S0 = 0

export const PlotterBlockView = (props: NodeProps<PlotterBlock>) => {
  const { values, size } = props.data
  const [showSettings, toggle] = useReducer((n) => !n, false)

  const scaleY = 4
  const max = 255

  const plotted = rescale(values, max)

  return (
    <div>
      <Handle
        type="target"
        position={Position.Left}
        id={S0.toString()}
        className="bg-cyan-9 group-hover:bg-cyan-11 hover:!bg-gray-12 hover:border-cyan-9 px-1 py-1 ml-[-1px] border-2 z-10"
      />

      <RightClickMenu toggle={toggle} show={showSettings}>
        <div className="group">
          {typeof size !== "number" && <div>error: missing size!</div>}

          <div
            className="flex items-end justify-start border-2 border-cyan-9"
            style={{
              minWidth: `${size + 2}px`,
              minHeight: `${max / scaleY}px`,
            }}
          >
            {plotted.map((bar, i) => (
              <div
                key={i}
                style={{ height: `${Math.round(bar / scaleY)}px` }}
                className="w-[1px] bg-cyan-9"
              />
            ))}
          </div>
        </div>
      </RightClickMenu>
    </div>
  )
}
