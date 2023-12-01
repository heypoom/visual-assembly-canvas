import { NodeProps } from "reactflow"

import { useReducer } from "react"

import { RightClickMenu } from "./components/RightClickMenu"
import { BlockHandle } from "./components/BlockHandle"

import { MemoryProps } from "../types/blocks"
import cn from "classnames"
import { engine } from "../engine"
import { updateNode } from "../store/blocks"
import { isBlock } from "./utils/is"

const columns = 10

export const MemoryBlock = (props: NodeProps<MemoryProps>) => {
  const { id, values } = props.data

  const [showSettings, toggle] = useReducer((n) => !n, false)

  function write(address: number, data: number) {
    updateNode(id, (node) => {
      if (isBlock.memory(node)) {
        node.data.values[address] = data
      }
    })

    engine.send(id, { Write: { address, data: [data] } })
    engine.ctx?.force_tick_block(id)
  }

  return (
    <div>
      <BlockHandle port={0} side="left" type="target" />

      <RightClickMenu id={id} show={showSettings} toggle={toggle}>
        <div className="group border-2 border-crimson-9 font-mono px-3 py-2">
          {values.length === 0 && <div className="text-crimson-11">[]</div>}

          {values.length > 0 && (
            <div
              className="grid items-center justify-center gap-x-4"
              style={{
                gridTemplateColumns: `repeat(${columns}, minmax(0, 20px))`,
              }}
            >
              {values.map((value, index) => {
                return (
                  <div key={index} className="w-8">
                    <input
                      value={value === 0 ? "" : value}
                      placeholder="000"
                      className={cn(
                        "w-8 text-center bg-transparent text-crimson-11 outline-gray-5",
                        value === 0 && "text-gray-9 placeholder:text-gray-8",
                      )}
                      onChange={(e) => {
                        const n = Number(e.target.value)
                        if (isNaN(n)) return write(index, 0)

                        write(index, n)
                      }}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </RightClickMenu>
    </div>
  )
}
