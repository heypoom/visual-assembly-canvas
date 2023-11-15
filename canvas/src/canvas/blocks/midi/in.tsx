import { useCallback, useEffect, useReducer, useState } from "react"
import cx from "classnames"
import { Handle, NodeProps, Position } from "reactflow"

import { MidiInProps } from "../../../types/blocks"
import { RightClickMenu } from "../../components/RightClickMenu"

import { useStore } from "@nanostores/react"
import { $midi } from "../../../store/midi"
import { manager } from "../../../core"

import {
  MidiEvent,
  isControlChangeEvent,
  isNoteEvent,
  midiManager,
} from "../../../midi/manager"

import { $status } from "../../../store/status"

const S1 = 1

export const MidiInBlock = (props: NodeProps<MidiInProps>) => {
  const { id, on, port, channels } = props.data

  const midi = useStore($midi)
  const status = useStore($status)

  const [ready, setReady] = useState(false)
  const [last, setLast] = useState<[number, number, number] | null>(null)
  const [showSettings, toggle] = useReducer((n) => !n, false)

  const handle = useCallback(
    (e: MidiEvent) => {
      let note = 0
      let value = 0
      const channel = e.message.channel ?? 0

      if (isControlChangeEvent(e)) {
        note = e.controller.number
        if (e.rawValue) value = e.rawValue
      }

      if (isNoteEvent(e)) {
        note = e.note.number
        value = e.note.rawAttack
      }

      setLast([note, value, channel])
      manager.send(id, { Midi: { event: on, value, note, channel, port } })

      if (!status.running) manager.step()
    },
    [id, on, port, status.running],
  )

  // NOTE: do not remove midi handler on unmount, as reactflow occasionally unmounts nodes.
  useEffect(() => {
    if (!ready) {
      midiManager.on(id, { type: on, handle, channels, port })
      setReady(true)
    }
  }, [channels, handle, id, on, port, ready, status.running])

  const reset = () => setLast(null)

  const input = midi.inputs[port]

  return (
    <div className="group">
      <div>
        <RightClickMenu
          id={id}
          show={showSettings}
          toggle={toggle}
          onReset={reset}
        >
          <div
            className={cx(
              "px-4 py-2 border-2 border-crimson-9 font-mono text-crimson-11 space-y-1",
              (!midi.ready || !ready) && "border-gray-10",
            )}
          >
            {last ? (
              <div className="text-1">
                {on}(n = {last[0]}, v = {last[1]}, ch = {last[2]})
              </div>
            ) : (
              <div className="text-1">{on}</div>
            )}

            {showSettings && (
              <div className="text-[9px] text-gray-9">
                {input && (
                  <div>
                    input: {input} ({port})
                  </div>
                )}

                <div>
                  channels:{" "}
                  {channels.length === 0 ? "all" : channels.join(", ")}
                </div>
              </div>
            )}
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
