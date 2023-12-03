import cn from "classnames"
import { useEffect, useReducer, useState } from "react"
import { NodeProps } from "reactflow"

import { BaseBlock } from "@/blocks/components"
import { engine } from "@/engine"
import { updateNode, updateNodeData } from "@/store/blocks"
import { MemoryProps } from "@/types/blocks"

import { isBlock } from "./utils/is"

const columns = 8

export const MemoryBlock = (props: NodeProps<MemoryProps>) => {
  const { id, auto_reset } = props.data

  const [isHex, setHex] = useState(false)

  const [isBatch, setBatch] = useState(true)
  const [batchInput, setBatchInput] = useState("")

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

  const Settings = () => (
    <div className="px-2 flex justify-center items-center text-center gap-x-2 gap-y-0">
      <div className="text-1 text-gray-6" onClick={() => setHex((s) => !s)}>
        {isHex ? "hex" : "dec"}
      </div>

      <div
        onClick={() => setBatch((s) => !s)}
        className={cn("text-1 text-gray-6", isBatch && "text-green-11")}
      >
        txt
      </div>

      <div
        onClick={toggleReset}
        className={cn("text-1 text-gray-6", auto_reset && "text-green-11")}
      >
        temp
      </div>
    </div>
  )

  return (
    <BaseBlock
      node={props}
      targets={1}
      className="border-green-9 font-mono px-4 py-3"
      settings={Settings}
    >
      {overGridLimit && !isBatch && (
        <p className="text-1 text-tomato-11">
          values too large ({count} items) <br /> use text mode to edit.
        </p>
      )}

      {!isBatch && !overGridLimit && (
        <div
          className="grid items-center justify-center gap-x-1 w-full"
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
        <textarea
          className="w-full bg-transparent text-1 font-mono outline-gray-4 nodrag text-green-11 h-[100px]"
          value={batchInput}
          onChange={(e) => setBatchInput(e.target.value)}
          onBlur={updateBatch}
        />
      )}
    </BaseBlock>
  )
}
