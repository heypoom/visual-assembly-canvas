import { useStore } from "@nanostores/react"
import { MidiOutputFormat } from "machine-wasm"

import { BaseBlock } from "@/blocks"
import { engine } from "@/engine"
import { updateNodeData } from "@/store/blocks"
import { $lastMidiEvent, $midi } from "@/store/midi"
import { BlockPropsOf } from "@/types/Node"
import { RadixSelect } from "@/ui"

import { MidiTransportForm } from "./transport"

const formats: MidiOutputFormat[] = [
  "Raw",
  "Note",
  "ControlChange",
  "Launchpad",
]

const formatOptions = formats.map((value) => ({ value, label: value }))

type MidiOutProps = BlockPropsOf<"MidiOut">
type MidiOutData = MidiOutProps["data"]

export const MidiOutBlock = (props: MidiOutProps) => {
  const { id, format, port, channel } = props.data

  const lastEvents = useStore($lastMidiEvent)
  const midi = useStore($midi)

  const last = lastEvents[id]

  function update(input: Partial<MidiOutData>) {
    updateNodeData(id, input)

    if (typeof input.format === "string") {
      engine.send(id, { type: "SetMidiOutputFormat", format: input.format })
    }

    if (input.port !== undefined) {
      engine.send(id, { type: "SetMidiPort", port: input.port })
    }

    if (input.channel !== undefined) {
      engine.send(id, { type: "SetMidiChannels", channels: [input.channel] })
    }
  }

  function getLog() {
    if (!last) return `${format}()`

    if (last.format === "Note") {
      const [note, velocity] = last.data as [number, number]
      return `${last.format}(n = ${note}, v = ${velocity})`
    }

    return `${last.format}(${last.data.join(", ")})`
  }

  const Settings = () => (
    <section className="flex flex-col space-y-4 w-full max-w-[200px]">
      <div
        className="grid items-center gap-4 w-full text-gray-11"
        style={{ gridTemplateColumns: "minmax(0, 1fr) minmax(0, 2fr)" }}
      >
        <p className="text-[10px]">Format</p>

        <RadixSelect
          value={format}
          onChange={(v) => update({ format: v as MidiOutputFormat })}
          options={formatOptions}
        />
      </div>

      <MidiTransportForm
        port={port}
        channels={[channel]}
        ports={midi.outputs}
        mode="out"
        onChange={(data) => {
          if ("channels" in data) {
            return update({ channel: data.channels?.[0] ?? 0 })
          }

          update(data)
        }}
      />
    </section>
  )

  return (
    <BaseBlock
      node={props}
      targets={1}
      settings={Settings}
      className="px-4 py-2 text-1 text-cyan-11 font-mono"
    >
      {getLog()}
    </BaseBlock>
  )
}
