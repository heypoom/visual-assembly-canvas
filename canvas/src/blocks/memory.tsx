import cn from "classnames"
import { useEffect, useReducer, useState } from "react"
import { NodeProps } from "reactflow"

import { engine } from "../engine"
import { updateNode, updateNodeData } from "../store/blocks"
import { MemoryProps } from "../types/blocks"
import { BlockHandle } from "./components/BlockHandle"
import { RightClickMenu } from "./components/RightClickMenu"
import { isBlock } from "./utils/is"

const columns = 8

export const MemoryBlock = (props: NodeProps<MemoryProps>) => {
  const { id, auto_reset } = props.data

  const [isHex, setHex] = useState(false)

  const [isBatch, setBatch] = useState(true)
  const [batchInput, setBatchInput] = useState("")

  const [showSettings, toggle] = useReducer((n) => !n, false)

  const base = isHex ? 16 : 10

  function set(address: number, data: number) {
    if (data > 65535) return

    updateNode(id, (node) => {
      if (isBlock.memory(node)) {
        node.data.values[address] = data
      }
    })
  }

  function toggleReset() {
    updateNodeData(id, { auto_reset: !auto_reset })
    engine.send(id, { SetAutoReset: { auto_reset: !auto_reset } })
    engine.ctx?.force_tick_block(id)
  }

  const values = [...props.data.values, 0]
  const count = Math.max(columns * 6, values.length)

  useEffect(() => {
    if (isBatch) {
      const data = props.data.values.map((v) => v.toString(base)).join(" ")

      setBatchInput(data)
    }
  }, [isBatch, isHex, props.data.values])

  function updateBatch() {
    if (!isBatch) return

    const values = batchInput
      .split(" ")
      .map((s) => parseInt(s, base))
      .filter((n) => !isNaN(n))

    if (values.length === 0) return

    updateNodeData(id, { values })
    engine.send(id, { Override: { data: values } })
    engine.ctx?.force_tick_block(id)
    engine.syncBlocks()
  }

  const gridLimit = 1000
  const overGridLimit = count > gridLimit

  return (
    <div>
      <BlockHandle port={0} side="left" type="target" />

      <RightClickMenu id={id} show={showSettings} toggle={toggle}>
        <div className="group border-2 border-green-9 font-mono py-2">
          {overGridLimit && !isBatch && (
            <p className="text-1 text-tomato-11 px-4 py-2">
              values too large ({count} items) <br /> use text mode to edit.
            </p>
          )}

          {!isBatch && !overGridLimit && (
            <div
              className="grid items-center justify-center gap-x-1 px-2"
              style={{
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              }}
            >
              {[...Array(count)].map((_, index) => {
                const value = values[index]

                return (
                  <div key={index} className="w-8">
                    <input
                      value={!value ? "" : value.toString(base)}
                      placeholder="0"
                      className={cn(
                        "w-8 text-center bg-transparent outline-gray-3 outline-1 text-1 uppercase",
                        value === 0 && "placeholder-gray-6",
                        value === undefined && "placeholder-gray-4",
                        value > 0 && "text-green-11",
                      )}
                      onChange={(e) => {
                        const n = parseInt(e.target.value, base)
                        if (isNaN(n)) return set(index, 0)

                        set(index, n)
                      }}
                      onBlur={() => {
                        if (value === undefined || value === null) return

                        engine.send(id, {
                          Write: { address: index, data: [value] },
                        })

                        engine.ctx?.force_tick_block(id)
                      }}
                    />
                  </div>
                )
              })}
            </div>
          )}

          {isBatch && (
            <div className="px-4 nodrag py-2 text-green-11">
              <textarea
                className="w-full bg-transparent text-1 font-mono outline-gray-4"
                value={batchInput}
                onChange={(e) => setBatchInput(e.target.value)}
                onBlur={updateBatch}
              />
            </div>
          )}

          <div className="px-2 flex justify-center items-center text-center gap-x-2">
            <div
              className="text-1 text-gray-6"
              onClick={() => setHex((s) => !s)}
            >
              {isHex ? "hex" : "dec"}
            </div>

            <div
              className={cn("text-1 text-gray-6", isBatch && "text-green-11")}
              onClick={() => setBatch((s) => !s)}
            >
              txt
            </div>

            <div
              className={cn(
                "text-1 text-gray-6",
                auto_reset && "text-green-11",
              )}
              onClick={toggleReset}
            >
              temp
            </div>
          </div>
        </div>
      </RightClickMenu>
    </div>
  )
}
