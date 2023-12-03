import { TextField } from "@radix-ui/themes"
import { useState } from "react"
import { NodeProps } from "reactflow"

import { BaseBlock } from "@/blocks/components"
import { engine } from "@/engine"
import { updateNodeData } from "@/store/blocks"
import { OscProps } from "@/types/blocks"
import { Waveform, WaveformKey } from "@/types/waveform"
import { RadixSelect } from "@/ui"

const waveforms: Record<WaveformKey, Waveform> = {
  Sine: { Sine: null },
  Cosine: { Cosine: null },
  Tangent: { Tangent: null },
  Square: { Square: { duty_cycle: 200 } },
  Sawtooth: { Sawtooth: null },
  Triangle: { Triangle: null },
  Noise: { Noise: null },
}

const waveformOptions = Object.keys(waveforms).map((value) => ({
  value,
  label: value,
}))

export const OscBlock = (props: NodeProps<OscProps>) => {
  const { id, waveform } = props.data

  const [cycleText, setCycleText] = useState("")
  const [cycleError, setCycleError] = useState(false)

  const wave = (
    typeof waveform === "object"
      ? Object.keys(waveform)?.[0]
      : typeof waveform === "string"
      ? waveform
      : "Sine"
  ) as WaveformKey

  function setWaveform(waveform: Waveform) {
    updateNodeData(id, { waveform })
    engine.send(id, { SetWaveform: { waveform } })
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
      argsText = `c = ${
        cycleText || ("Square" in waveform && waveform?.Square?.duty_cycle)
      }`
    }

    return `${wave?.toLowerCase()}(${argsText})`
  }

  const Settings = () => (
    <section className="flex flex-col space-y-2 w-full">
      <div className="flex items-center gap-4 w-full">
        <p className="text-1">Fn</p>

        <RadixSelect
          value={wave.toString()}
          onChange={handleWaveChange}
          options={waveformOptions}
        />
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
  )

  return (
    <BaseBlock
      node={props}
      targets={1}
      sources={1}
      settings={Settings}
      className="px-4 py-2 font-mono text-center"
    >
      {getOscLog()}
    </BaseBlock>
  )
}
