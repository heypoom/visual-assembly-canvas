import { useStore } from "@nanostores/react"
import { Flex, TextField } from "@radix-ui/themes"
import { Port } from "machine-wasm"
import { memo, useState } from "react"

import { BaseBlock } from "@/blocks/components"
import { engine } from "@/engine"
import { updateNodeData } from "@/store/blocks"
import { $status } from "@/store/status"
import { BlockPropsOf } from "@/types/Node"

type TapProps = BlockPropsOf<"Tap">

export const TapBlock = memo((props: TapProps) => {
  const { id, signal } = props.data

  const status = useStore($status)
  const [signalText, setSignalText] = useState(signal?.join(" ") ?? "")

  function tap() {
    try {
      engine.ctx?.send_message({
        sender: new Port(id, 0),
        action: { Data: { body: signal } },
      })
    } catch (err) {
      console.warn("cannot send tap:", err)
    }

    if (!status.running) engine.stepSlow(1)
  }

  function updateSignal() {
    const signal = signalText.split(" ").map((s) => parseInt(s))

    if (signal.length === 0) return
    if (signal.some((s) => isNaN(s))) return

    updateNodeData(id, { signal })
  }

  const Settings = () => (
    <div className="font-mono absolute w-[160px] z-1 bg-gray-2 top-[46px] px-3 py-2 rounded-2 border-2 border-gray-8">
      <Flex className="gap-x-2" justify="center" align="center">
        <div className="text-[10px]">signal</div>

        <TextField.Input
          size="1"
          className="w-[200px] nodrag"
          value={signalText}
          onChange={(e) => setSignalText(e.target.value)}
          onBlur={updateSignal}
        />
      </Flex>
    </div>
  )

  return (
    <BaseBlock
      node={props}
      sources={1}
      className="rounded-1 px-5 py-2 bg-gray-5 border-2 border-gray-8 items-center justify-center gap-y-3"
      settings={Settings}
    >
      <button
        className="w-5 h-5 rounded-[100%] bg-crimson-9 hover:bg-cyan-11 border-2 border-gray-12 active:bg-cyan-9 focus:bg-cyan-11 outline-gray-12 focus:outline-cyan-12"
        onClick={tap}
      />
    </BaseBlock>
  )
})
