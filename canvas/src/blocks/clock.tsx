import { useReducer } from "react"
import { NodeProps } from "reactflow"

import { ClockProps } from "@/types/blocks"

import { BlockHandle } from "./components/BlockHandle"
import { RightClickMenu } from "./components/RightClickMenu"

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

      <BlockHandle port={0} side="right" type="source" />
    </div>
  )
}
