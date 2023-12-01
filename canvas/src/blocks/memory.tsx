import { NodeProps } from "reactflow"

import { useReducer } from "react"

import { RightClickMenu } from "./components/RightClickMenu"
import { BlockHandle } from "./components/BlockHandle"

import { MemoryProps } from "../types/blocks"

export const MemoryBlock = (props: NodeProps<MemoryProps>) => {
  const { id, values } = props.data

  const [showSettings, toggle] = useReducer((n) => !n, false)

  return (
    <div>
      <BlockHandle port={0} side="left" type="target" />

      <RightClickMenu id={id} show={showSettings} toggle={toggle}>
        <div className="group border-2 border-crimson-9 font-mono px-3 py-2 space-y-2">
          {values.length === 0 && <div className="text-crimson-11">[]</div>}

          {values.map((value, index) => {
            return (
              <div key={index} className="text-crimson-11">
                {value}
              </div>
            )
          })}
        </div>
      </RightClickMenu>
    </div>
  )
}
