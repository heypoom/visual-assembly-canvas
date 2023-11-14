import { useReducer } from "react"
import { Handle, NodeProps, Position } from "reactflow"
import { MidiOutputFormat as _MidiOutputFormat } from "machine-wasm"

import { MidiOutProps } from "../../../types/blocks"
import { RightClickMenu } from "../../components/RightClickMenu"
import { Select } from "@radix-ui/themes"
import { MidiOutputFormat } from "../../../types/enums"
import { manager } from "../../../core"
import { updateNodeData } from "../../../store/blocks"
import { useStore } from "@nanostores/react"
import { $lastMidiEvent } from "../../../store/midi"

const S0 = 0

const formats = Object.keys(_MidiOutputFormat).filter(
  (key) => !isNaN(Number(_MidiOutputFormat[key as MidiOutputFormat])),
)

export const MidiOutBlock = (props: NodeProps<MidiOutProps>) => {
  const { id, format } = props.data

  const lastEvents = useStore($lastMidiEvent)
  const [showSettings, toggle] = useReducer((n) => !n, false)

  const last = lastEvents[id]?.Midi

  function update(input: Partial<MidiOutProps>) {
    updateNodeData(id, input)

    // Update the behaviour of pixel block.
    if (typeof input.format === "string") {
      manager.ctx?.send_message_to_block(id, {
        SetMidiOutputFormat: { format: input.format },
      })
    }
  }

  function getLog() {
    if (!last) return `${format}()`

    if (last.format === "Note") {
      const [note, velocity] = last.data as [number, number]
      return `${last.format}(note = ${note}, velocity = ${velocity})`
    }

    return `${last.format}(${last.data.join(", ")})`
  }

  return (
    <div className="group">
      <Handle
        type="target"
        position={Position.Left}
        id={S0.toString()}
        className="bg-crimson-9 group-hover:bg-cyan-11 hover:!bg-gray-12 hover:border-crimson-9 px-1 py-1 ml-[-1px] border-2 z-10"
      />

      <RightClickMenu id={id} show={showSettings} toggle={toggle}>
        <div className="border-2 px-4 py-3 border-cyan-9 space-y-2 text-1 font-mono">
          <div className="text-cyan-11">{getLog()}</div>

          {showSettings && (
            <section className="flex flex-col space-y-2 w-full">
              <div className="flex items-center gap-4 w-full">
                <p className="text-[10px]">Format</p>

                <Select.Root
                  size="1"
                  value={format}
                  onValueChange={(v) =>
                    update({ format: v as MidiOutputFormat })
                  }
                >
                  <Select.Trigger className="w-[90px]" />

                  <Select.Content>
                    {formats.map((key) => (
                      <Select.Item value={key} key={key}>
                        {key}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </div>
            </section>
          )}
        </div>
      </RightClickMenu>
    </div>
  )
}
