import { useStore } from "@nanostores/react"
import { useMemo } from "react"

import { BaseBlock } from "@/blocks"
import { Settings } from "@/blocks/components/Settings"
import { createSchema } from "@/blocks/types/schema"
import { engine } from "@/engine"
import { $lastMidiEvent, $midi } from "@/store/midi"
import { BlockPropsOf } from "@/types/Node"

import { MidiTransportForm } from "./transport"

type MidiOutProps = BlockPropsOf<"MidiOut">
type MidiOutData = MidiOutProps["data"]

export const MidiOutBlock = (props: MidiOutProps) => {
  const { id, format, channel } = props.data

  const lastEvents = useStore($lastMidiEvent)
  const midi = useStore($midi)

  const last = lastEvents[id]

  const update = (input: Partial<MidiOutData>) =>
    engine.setBlock(id, "MidiOut", input)

  const schema = useMemo(() => {
    return createSchema({
      type: "MidiOut",
      fields: [
        {
          key: "format",
          type: "select",
          options: [
            { key: "Note" },
            { key: "ControlChange", title: "Control Change" },
            { key: "Raw" },
            { key: "Launchpad" },
          ],
        },
        {
          key: "port",
          type: "select",
          from: (v) => (v as number).toString(),
          into: (v) => parseInt(v as string),

          // @ts-expect-error - to fix later, incompatible with key inference
          options: midi.outputs.map((port, id) => ({
            key: id.toString(),
            title: port,
          })),
        },
      ],
    })
  }, [midi.outputs])

  function getLog() {
    if (!last) return `${format}()`

    if (last.format === "Note") {
      const [note, velocity] = last.data as [number, number]
      return `${last.format}(n = ${note}, v = ${velocity})`
    }

    return `${last.format}(${last.data.join(", ")})`
  }

  const settings = () => (
    <Settings id={id} schema={schema}>
      <MidiTransportForm
        channels={[channel]}
        mode="out"
        onChange={(data) => {
          if ("channels" in data) {
            return update({ channel: data.channels?.[0] ?? 0 })
          }
        }}
      />
    </Settings>
  )

  return (
    <BaseBlock
      node={props}
      targets={1}
      settings={settings}
      className="px-4 py-2 text-1 text-cyan-11 font-mono"
    >
      {getLog()}
    </BaseBlock>
  )
}
