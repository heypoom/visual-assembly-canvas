import { Handle, NodeProps, Position } from "reactflow"
import { manager } from "../../core"
import { Port } from "machine-wasm"
import { TapBlock } from "../../types/blocks"
import { Flex, TextField } from "@radix-ui/themes"
import { useReducer, useState } from "react"

import { RightClickMenu } from "../components/RightClickMenu"
import { updateNodeData } from "../../store/blocks"
import { useStore } from "@nanostores/react"
import { $status } from "../../store/status"

const S1 = 1

// TODO: send message to connected port on tap
// TODO: add ways for blocks to send events from the frontend
export const TapBlockView = (props: NodeProps<TapBlock>) => {
  const { id, signal } = props.data

  const [signalText, setSignalText] = useState(signal?.join(" ") ?? "")
  const [showSettings, toggle] = useReducer((n) => !n, false)

  const status = useStore($status)

  function tap() {
    try {
      manager.ctx?.send_message({
        port: new Port(id, S1),
        action: { Data: { body: signal } },
      })
    } catch (err) {
      console.warn("cannot send tap:", err)
    }

    // Only step the execution if the program is not running.
    // TODO: can we improve this?
    // TODO: traverse the graph node to only tick connected nodes.
    if (!status.running) manager.step()
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
        <RightClickMenu show={showSettings} toggle={toggle}>
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

      <Handle
        type="source"
        position={Position.Right}
        id={S1.toString()}
        className="bg-gray-9 group-hover:bg-cyan-11 hover:!bg-gray-12 hover:!border-crimson-9 px-1 py-1 ml-[-1px] border-2 z-10 border-gray-11 group-hover:border-gray-12"
      />
    </div>
  )
}
