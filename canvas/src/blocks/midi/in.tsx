import { useStore } from "@nanostores/react"
import { MidiInputEvent } from "machine-wasm"
import { useCallback, useEffect, useRef, useState } from "react"

import { BaseBlock } from "@/blocks"
import { engine } from "@/engine"
import {
  isControlChangeEvent,
  isNoteEvent,
  MidiEvent,
  midiManager,
} from "@/services/midi"
import { $midi } from "@/store/midi"
import { $status } from "@/store/status"
import { BlockPropsOf } from "@/types/Node"
import { RadixSelect } from "@/ui"

import { MidiTransportForm } from "./transport"

const events: MidiInputEvent[] = ["NoteOn", "NoteOff", "ControlChange"]
const eventOptions = events.map((value) => ({ value, label: value }))

type MidiInProps = BlockPropsOf<"MidiIn">
type MidiInData = MidiInProps["data"]

export const MidiInBlock = (props: MidiInProps) => {
  const { id, on, port, channels } = props.data

  const midi = useStore($midi)
  const status = useStore($status)
  const key = useRef("")

  const [last, setLast] = useState<[number, number, number] | null>(null)

  const update = (input: Partial<MidiInData>) =>
    engine.setBlock(id, "MidiIn", input)

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
      engine.send(id, { type: "Midi", event: on, value, note, channel, port })

      if (!status.running) engine.stepSlow()
    },
    [id, on, port, status.running],
  )

  useEffect(() => {
    const currKey = `${id}-${on}-${port}-${channels}`
    if (key.current === currKey) return

    midiManager.on(id, { type: on, handle, channels, port }).then()

    key.current = currKey
  }, [id, on, port, channels, handle])

  const reset = () => setLast(null)

  const MidiSettings = () => (
    <div className="max-w-[200px] space-y-3">
      <div
        className="grid items-center gap-4 w-full text-gray-11"
        style={{
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 2fr)",
        }}
      >
        <p className="text-[10px]">Event</p>

        <RadixSelect
          value={on}
          onChange={(v) => update({ on: v as MidiInputEvent })}
          options={eventOptions}
        />
      </div>

      <MidiTransportForm
        port={port}
        channels={channels}
        ports={midi.inputs}
        mode="in"
        onChange={update}
      />
    </div>
  )

  return (
    <BaseBlock
      node={props}
      sources={1}
      onReset={reset}
      settings={MidiSettings}
      className="px-4 py-2 font-mono text-crimson-11"
    >
      {last ? (
        <div className="text-1">
          {on}(n = {last[0]}, v = {last[1]}, ch = {last[2]})
        </div>
      ) : (
        <div className="text-1">{on}</div>
      )}
    </BaseBlock>
  )
}
