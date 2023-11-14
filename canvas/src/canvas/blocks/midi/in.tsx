import { useCallback, useEffect, useReducer, useState } from "react"
import cx from "classnames"
import { Handle, NodeProps, Position } from "reactflow"

import { MidiInProps } from "../../../types/blocks"
import { RightClickMenu } from "../../components/RightClickMenu"

import { useStore } from "@nanostores/react"
import { $midi } from "../../../store/midi"
import { manager } from "../../../core"

import { midiManager } from "./manager"
import { $status } from "../../../store/status"

const S1 = 1

export const MidiInBlock = (props: NodeProps<MidiInProps>) => {
  const { id, on } = props.data

  const midi = useStore($midi)
  const status = useStore($status)

  const [ready, setReady] = useState(false)
  const [last, setLast] = useState<[number, number] | null>(null)
  const [showSettings, toggle] = useReducer((n) => !n, false)

  const handle = useCallback(
    (note: number, value: number) => {
      setLast([note, value])

      manager.ctx?.send_message_to_block(id, {
        Midi: { event: on, note, value },
      })

      if (!status.running) manager.step()
    },
    [id, on, status.running],
  )

  useEffect(() => {
    if (!ready) {
      midiManager.on(id, on, handle)
      setReady(true)
    }

    // TODO: useEffect destructors.
    return () => {}
  }, [handle, id, on, ready, status.running])

  return (
    <div className="group">
      <div>
        <RightClickMenu id={id} show={showSettings} toggle={toggle}>
          <div
            className={cx(
              "px-4 py-2 border-2 border-crimson-9 font-mono text-crimson-11",
              (!midi.ready || !ready) && "border-gray-10",
            )}
          >
            <div>{on}</div>

            {last !== null && <div>[{last?.join(", ")}]</div>}
          </div>
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
