import { useStore } from "@nanostores/react"
import { MidiOutputFormat as _MidiOutputFormat } from "machine-wasm"
import { useReducer } from "react"
import { NodeProps } from "reactflow"

import { BlockHandle } from "@/blocks/components"
import { RightClickMenu } from "@/blocks/components"
import { engine } from "@/engine"
import { updateNodeData } from "@/store/blocks"
import { $lastMidiEvent, $midi } from "@/store/midi"
import { MidiOutProps } from "@/types/blocks"
import { MidiOutputFormat } from "@/types/enums"
import { RadixSelect } from "@/ui/select"

import { MidiTransportForm } from "./transport"

const formats = Object.keys(_MidiOutputFormat).filter(
  (key) => !isNaN(Number(_MidiOutputFormat[key as MidiOutputFormat])),
)

const formatOptions = formats.map((value) => ({ value, label: value }))

export const MidiOutBlock = (props: NodeProps<MidiOutProps>) => {
  const { id, format, port, channel } = props.data

  const lastEvents = useStore($lastMidiEvent)
  const midi = useStore($midi)
  const [showSettings, toggle] = useReducer((n) => !n, false)

  const last = lastEvents[id]?.Midi

  function update(input: Partial<MidiOutProps>) {
    updateNodeData(id, input)

    if (typeof input.format === "string") {
      engine.send(id, { SetMidiOutputFormat: { format: input.format } })
    }

    if (input.port !== undefined) {
      engine.send(id, { SetMidiPort: { port: input.port } })
    }

    if (input.channel !== undefined) {
      engine.send(id, { SetMidiChannels: { channels: [input.channel] } })
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

  return (
    <div className="group">
      <BlockHandle port={1} side="left" type="target" />

      <RightClickMenu id={id} show={showSettings} toggle={toggle}>
        <div className="border-2 px-4 py-3 border-cyan-9 space-y-2 text-1 font-mono">
          <div className="text-cyan-11">{getLog()}</div>

          {showSettings && (
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
          )}
        </div>
      </RightClickMenu>
    </div>
  )
}
