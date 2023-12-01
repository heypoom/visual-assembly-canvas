import { NodeProps } from "reactflow"

import { useReducer, useState } from "react"

import { RightClickMenu } from "./components/RightClickMenu"
import { BlockHandle } from "./components/BlockHandle"

import { MemoryProps } from "../types/blocks"
import cn from "classnames"
import { engine } from "../engine"
import { updateNode } from "../store/blocks"
import { isBlock } from "./utils/is"

const columns = 10

export const MemoryBlock = (props: NodeProps<MemoryProps>) => {
  const { id } = props.data

  const [isHex, setHex] = useState(false)
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

  const values = [...props.data.values, 0]

  const count = Math.max(columns * 6, values.length)

  return (
    <div>
      <BlockHandle port={0} side="left" type="target" />

      <RightClickMenu id={id} show={showSettings} toggle={toggle}>
        <div className="group border-2 border-green-9 font-mono py-2">
          {values.length === 0 && <div className="text-green-11">[]</div>}

          {values.length > 0 && (
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
                      placeholder="00"
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

          <div className="px-2 flex justify-end">
            <div
              className="text-1 text-gray-9"
              onClick={() => setHex((s) => !s)}
            >
              {isHex ? "hex" : "oct"}
            </div>
          </div>
        </div>
      </RightClickMenu>
    </div>
  )
}
