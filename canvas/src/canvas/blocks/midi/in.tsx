import { useReducer } from "react"
import { Handle, NodeProps, Position } from "reactflow"

import { MidiInProps } from "../../../types/blocks"
import { RightClickMenu } from "../../components/RightClickMenu"

const S1 = 1

export const MidiInBlock = (props: NodeProps<MidiInProps>) => {
  const { id } = props.data

  const [showSettings, toggle] = useReducer((n) => !n, false)

  return (
    <div className="group">
      <div>
        <RightClickMenu show={showSettings} toggle={toggle}>
          <div>MIDI IN - {id}</div>
        </RightClickMenu>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id={S1.toString()}
        className="bg-crimson-9 group-hover:bg-cyan-11 hover:!bg-gray-12 hover:border-crimson-9 px-1 py-1 mr-[-1px] border-2 z-10"
      />
    </div>
  )
}
