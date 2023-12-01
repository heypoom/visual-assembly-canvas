import { useReducer, useState } from "react"
import { NodeProps } from "reactflow"
import { Flex, TextField } from "@radix-ui/themes"
import { Port } from "machine-wasm"
import { useStore } from "@nanostores/react"

import { engine } from "../engine"
import { TapProps } from "../types/blocks"

import { BlockHandle } from "./components/BlockHandle"
import { RightClickMenu } from "./components/RightClickMenu"

import { $status } from "../store/status"
import { updateNodeData } from "../store/blocks"

const PORT = 0

export const TapBlock = (props: NodeProps<TapProps>) => {
  const { id, signal } = props.data

  const [signalText, setSignalText] = useState(signal?.join(" ") ?? "")
  const [showSettings, toggle] = useReducer((n) => !n, false)

  const status = useStore($status)

  function tap() {
    try {
      engine.ctx?.send_message({
        sender: new Port(id, PORT),
        action: { Data: { body: signal } },
      })
    } catch (err) {
      console.warn("cannot send tap:", err)
    }

    if (!status.running) engine.stepSlow(1)
  }

  function setSignal() {
    const signal = signalText.split(" ").map((s) => parseInt(s))

    if (signal.length === 0) return
    if (signal.some((s) => isNaN(s))) return

    updateNodeData(id, { signal })
  }

  return (
    <div className="group">
      <div>
        <RightClickMenu id={id} show={showSettings} toggle={toggle}>
          <div className="rounded-1 px-5 py-2 bg-gray-5 border-2 border-gray-8 hover:border-cyan-9 flex flex-col items-center justify-center gap-y-3">
            <button
              className="w-5 h-5 rounded-[100%] bg-crimson-9 hover:bg-cyan-11 border-2 border-gray-12 active:bg-cyan-9 focus:bg-cyan-11 outline-gray-12 focus:outline-cyan-12"
              onClick={tap}
            />

            {showSettings && (
              <div className="font-mono text-1">
                <Flex className="gap-x-2" justify="center" align="center">
                  <div className="text-[10px]">signal</div>

                  <TextField.Input
                    size="1"
                    className="max-w-[100px]"
                    value={signalText}
                    onChange={(e) => setSignalText(e.target.value)}
                    onBlur={setSignal}
                  />
                </Flex>
              </div>
            )}
          </div>
        </RightClickMenu>
      </div>

      <BlockHandle port={PORT} side="right" type="source" />
    </div>
  )
}
