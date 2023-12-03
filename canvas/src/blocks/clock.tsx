import { TextField } from "@radix-ui/themes"
import { useState } from "react"
import { NodeProps } from "reactflow"

import { BaseBlock } from "@/blocks"
import { engine } from "@/engine"
import { ClockProps } from "@/types/blocks"

export const ClockBlock = (props: NodeProps<ClockProps>) => {
  const { id, freq = 0 } = props.data

  const [rateInput, setRateInput] = useState(freq.toString())
  const [cycleError, setCycleError] = useState(false)

  const time = props.data?.time?.toString()?.padStart(3, "0") ?? "000"

  const Settings = () => (
    <div className="flex items-center gap-4 w-full">
      <p className="text-1">Frequency</p>

      <TextField.Input
        className="max-w-[70px]"
        size="1"
        type="number"
        min={0}
        max={255}
        value={rateInput}
        onChange={(k) => {
          const str = k.target.value
          setRateInput(str)

          const freq = parseInt(str)
          const valid = !isNaN(freq) && freq >= 0 && freq <= 255
          setCycleError(!valid)

          if (valid) {
            engine.send(id, { SetClockFreq: { freq } })
            engine.ctx?.force_tick_block(id)
          }
        }}
        {...(cycleError && { color: "tomato" })}
      />
    </div>
  )

  return (
    <BaseBlock
      className="text-crimson-11 px-4 py-2 font-mono"
      node={props}
      sources={1}
      settings={Settings}
    >
      t = {time}
    </BaseBlock>
  )
}
