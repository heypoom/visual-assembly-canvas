import { Handle, NodeProps, Position } from "reactflow"

import { OscBlock, Waveform } from "../../types/blocks"
import { manager } from "../../core"
import { Select } from "@radix-ui/themes"
import { isOscNode } from "."
import { produce } from "immer"
import { $nodes } from "../../store/nodes"
import { RightClickMenu } from "../components/RightClickMenu"
import { useReducer } from "react"

const S1 = 1

type WaveformKey = keyof Waveform

const waveforms: Record<WaveformKey, Waveform> = {
  Sine: { Sine: null },
  Cosine: { Cosine: null },
  Tangent: { Tangent: null },
  Square: { Square: { duty_cycle: 200 } },
  Sawtooth: { Sawtooth: null },
  Triangle: { Triangle: null },
  Noise: { Noise: null },
}

export const OscBlockView = (props: NodeProps<OscBlock>) => {
  const { id, time = 0, waveform } = props.data

  const [showSettings, toggle] = useReducer((n) => !n, false)

  const wave =
    typeof waveform === "object"
      ? Object.keys(waveform)?.[0]
      : typeof waveform === "string"
      ? waveform
      : "osc"

  function setWaveform(waveform: WaveformKey) {
    const next = produce($nodes.get(), (nodes) => {
      const node = nodes.find((n) => n.data.id === id)
      if (!node) return

      const s = waveforms[waveform]

      // Update the pixels.
      if (isOscNode(node)) {
        node.data = { ...node.data, waveform: s }
      }

      // Update the behaviour of pixel block.
      if (s) {
        manager.ctx?.send_message_to_block(id, {
          SetWaveform: { waveform: s },
        })
      }
    })

    $nodes.set(next)
  }

  return (
    <div>
      <RightClickMenu show={showSettings} toggle={toggle}>
        <div className="group border-2 border-crimson-9 font-mono px-3 py-2 space-y-2">
          <div className="text-crimson-11">
            {wave?.toLowerCase()}(t = {time})
          </div>

          {showSettings && (
            <section>
              <div className="flex items-center gap-4 w-full">
                <p className="text-1">Fn</p>

                <Select.Root
                  size="1"
                  value={wave.toString()}
                  onValueChange={(k) => setWaveform(k as WaveformKey)}
                >
                  <Select.Trigger className="w-[70px]" />

                  <Select.Content>
                    {Object.keys(waveforms).map((key) => (
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

      <Handle
        type="source"
        position={Position.Right}
        id={S1.toString()}
        className="bg-crimson-9 group-hover:bg-cyan-11 hover:!bg-gray-12 hover:border-crimson-9 px-1 py-1 ml-[-1px] border-2 z-10"
      />
    </div>
  )
}
