import { useReducer } from "react"
import { Handle, NodeProps, Position } from "reactflow"

import { MidiOutProps } from "../../../types/blocks"
import { RightClickMenu } from "../../components/RightClickMenu"

const S0 = 0

export const MidiOutBlock = (props: NodeProps<MidiOutProps>) => {
  const { id } = props.data

  const [showSettings, toggle] = useReducer((n) => !n, false)

  return (
    <div className="group">
      <Handle
        type="target"
        position={Position.Left}
        id={S0.toString()}
        className="bg-crimson-9 group-hover:bg-cyan-11 hover:!bg-gray-12 hover:border-crimson-9 px-1 py-1 ml-[-1px] border-2 z-10"
      />

      <div>
        <RightClickMenu show={showSettings} toggle={toggle}>
          <div>MIDI OUT - {id}</div>
        </RightClickMenu>
      </div>
    </div>
  )
}
