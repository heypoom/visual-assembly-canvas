import { Handle, NodeProps, Position } from "reactflow"
import { manager } from "../../core"
import { Port } from "machine-wasm"
import { TapBlock } from "../../types/blocks"
import { Flex, TextField } from "@radix-ui/themes"
import { useReducer, useState } from "react"
import { produce } from "immer"
import { isTapNode } from "."
import { $nodes } from "../../store/nodes"
import { RightClickMenu } from "../components/RightClickMenu"

const S1 = 1

// TODO: send message to connected port on tap
// TODO: add ways for blocks to send events from the frontend
export const TapBlockView = (props: NodeProps<TapBlock>) => {
  const { id, signal = [1] } = props.data

  const [signalText, setSignalText] = useState(signal?.join(" "))
  const [showSettings, toggle] = useReducer((n) => !n, false)

  function tap() {
    try {
      manager.ctx?.send_message({
        port: new Port(id, S1),
        action: { Data: { body: signal } },
      })
    } catch (err) {
      console.warn("cannot send tap:", err)
    }

    manager.step()
  }

  function update(input: Partial<TapBlock>) {
    const next = produce($nodes.get(), (nodes) => {
      const node = nodes.find((n) => n.data.id === props.data.id)
      if (!node) return

      if (isTapNode(node)) node.data = { ...node.data, ...input }
    })

    $nodes.set(next)
  }

  return (
    <div className="group">
      <div>
        <RightClickMenu show={showSettings} toggle={toggle}>
          <div className="rounded-1 px-3 py-2 bg-gray-5 border-2 border-gray-8 hover:border-cyan-9 flex flex-col items-center justify-center gap-y-3">
            <button
              className="w-5 h-5 rounded-[100%] bg-cyan-11 hover:bg-cyan-9 border-2 border-gray-12"
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
                    onBlur={() => {
                      const signal = signalText
                        .split(" ")
                        .map((s) => parseInt(s))

                      if (signal.length === 0) return
                      if (signal.some((s) => isNaN(s))) return

                      update({ signal })
                    }}
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
        className="bg-crimson-9 group-hover:bg-cyan-11 hover:!bg-gray-12 hover:border-crimson-9 px-1 py-1 ml-[-1px] border-2 z-10"
      />
    </div>
  )
}
