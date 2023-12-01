import { Handle, NodeProps, Position } from "reactflow"

import { ClockProps } from "../types/blocks"

import { RightClickMenu } from "./components/RightClickMenu"
import { useReducer } from "react"

const S1 = 1

export const ClockBlock = (props: NodeProps<ClockProps>) => {
  const { id } = props.data

  const [showSettings, toggle] = useReducer((n) => !n, false)

  const time = props.data?.time?.toString()?.padStart(3, "0") ?? "000"

  return (
    <div>
      <RightClickMenu id={id} show={showSettings} toggle={toggle}>
        <div className="group border-2 border-crimson-9 font-mono px-3 py-2 space-y-2">
          <div className="text-crimson-11">t = {time}</div>
        </div>
      </RightClickMenu>

      <Handle
        type="source"
        position={Position.Right}
        id={S1.toString()}
        className="bg-crimson-9 group-hover:bg-cyan-11 hover:!bg-gray-12 hover:border-crimson-9 px-1 py-1 ml-[-1px] border-2 z-10"
      />
    </div>
  )
}
