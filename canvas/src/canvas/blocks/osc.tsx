import { Handle, NodeProps, Position } from "reactflow"

import { OscProps } from "../../types/blocks"
import { manager } from "../../core"
import { Select, TextField } from "@radix-ui/themes"

import { RightClickMenu } from "../components/RightClickMenu"
import { useReducer, useState } from "react"
import { updateNodeData } from "../../store/blocks"
import { WaveformKey, Waveform } from "../../types/waveform"

const S1 = 1

const waveforms: Record<WaveformKey, Waveform> = {
  Sine: { Sine: null },
  Cosine: { Cosine: null },
  Tangent: { Tangent: null },
  Square: { Square: { duty_cycle: 200 } },
  Sawtooth: { Sawtooth: null },
  Triangle: { Triangle: null },
  Noise: { Noise: null },
}

export const OscBlock = (props: NodeProps<OscProps>) => {
  const { id, time = 0, waveform } = props.data

  const [cycleText, setCycleText] = useState("")
  const [cycleError, setCycleError] = useState(false)
  const [showSettings, toggle] = useReducer((n) => !n, false)

  const wave = (
    typeof waveform === "object"
      ? Object.keys(waveform)?.[0]
      : typeof waveform === "string"
      ? waveform
      : "Sine"
  ) as WaveformKey

  function setWaveform(waveform: Waveform) {
    updateNodeData(id, { waveform })

    manager.ctx?.send_message_to_block(id, {
      SetWaveform: { waveform },
    })
  }

  function handleWaveChange(key: string) {
    let w = waveforms[key as WaveformKey]

    // Update duty cycle
    if ("Square" in w) {
      if (cycleText) {
        const cycle = parseInt(cycleText)

        if (!isNaN(cycle)) {
          w = { ...w, Square: { duty_cycle: cycle } }
        }
      } else {
        setCycleText(w.Square.duty_cycle.toString())
      }
    }

    setWaveform(w)
  }

  function getOscLog() {
    let argsText = ""

    if (wave === "Square") {
      argsText = `, c = ${
        cycleText || ("Square" in waveform && waveform?.Square?.duty_cycle)
      }`
    }

    return `${wave?.toLowerCase()}(t = ${time
      ?.toString()
      ?.padStart(3, "0")}${argsText})`
  }

  return (
    <div>
      <RightClickMenu id={id} show={showSettings} toggle={toggle}>
        <div className="group border-2 border-crimson-9 font-mono px-3 py-2 space-y-2">
          <div className="text-crimson-11">{getOscLog()}</div>

          {showSettings && (
            <section className="flex flex-col space-y-2 w-full">
              <div className="flex items-center gap-4 w-full">
                <p className="text-1">Fn</p>

                <Select.Root
                  size="1"
                  value={wave.toString()}
                  onValueChange={handleWaveChange}
                >
                  <Select.Trigger className="w-[90px]" />

                  <Select.Content>
                    {Object.keys(waveforms).map((key) => (
                      <Select.Item value={key} key={key}>
                        {key}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </div>

              {wave === "Square" && (
                <div className="flex items-center gap-4 w-full">
                  <p className="text-1">Cycle</p>

                  <TextField.Input
                    className="max-w-[70px]"
                    size="1"
                    type="number"
                    min={0}
                    max={255}
                    value={cycleText}
                    onChange={(k) => {
                      const str = k.target.value
                      setCycleText(str)

                      const cycle = parseInt(str)
                      const valid = !isNaN(cycle) && cycle >= 0 && cycle <= 255
                      setCycleError(!valid)

                      if (valid) {
                        setWaveform({ Square: { duty_cycle: cycle } })
                      }
                    }}
                    {...(cycleError && { color: "tomato" })}
                  />
                </div>
              )}
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
