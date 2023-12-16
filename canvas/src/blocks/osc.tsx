import { TextField } from "@radix-ui/themes"
import { Waveform } from "machine-wasm"
import { useState } from "react"

import { BaseBlock } from "@/blocks/components"
import { engine } from "@/engine"
import { updateNodeData } from "@/store/blocks"
import { BlockPropsOf } from "@/types/Node"
import { RadixSelect } from "@/ui"

export type WaveformKey = Waveform["type"]

const waveforms: WaveformKey[] = [
  "Sine",
  "Cosine",
  "Tangent",
  "Square",
  "Sawtooth",
  "Triangle",
]

const waveformOptions = waveforms.map((value) => ({
  value,
  label: value,
}))

type OscProps = BlockPropsOf<"Osc">

export const OscBlock = (props: OscProps) => {
  const { id, waveform } = props.data
  const wave = waveform.type

  const [cycleText, setCycleText] = useState("")
  const [cycleError, setCycleError] = useState(false)

  function setWaveform(waveform: Waveform) {
    updateNodeData(id, { waveform })
    engine.send(id, { type: "SetWaveform", waveform })
  }

  function handleWaveChange(key: string) {
    let w = { type: key } as Waveform

    // Update duty cycle
    if (w.type === "Square") {
      if (cycleText) {
        const cycle = parseInt(cycleText)

        if (!isNaN(cycle)) w = { ...w, duty_cycle: cycle }
      } else {
        setCycleText(w.duty_cycle.toString())
      }
    }

    setWaveform(w)
  }

  function getOscLog() {
    let argsText = ""

    if (wave === "Square") {
      argsText = `c = ${
        cycleText || (waveform.type === "Square" && waveform.duty_cycle)
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
                setWaveform({ type: "Square", duty_cycle: cycle })
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
