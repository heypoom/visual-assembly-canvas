import { useReducer } from "react"
import { PixelMode as _PixelMode } from "machine-wasm"
import { Select, TextField } from "@radix-ui/themes"
import { Handle, NodeProps, Position } from "reactflow"
import { EyeClosedIcon, MixerHorizontalIcon } from "@radix-ui/react-icons"

import { PaletteKey, getPixelColor, palettes } from "./palette"

import type { PixelProps } from "../../../types/blocks"

import { manager } from "../../../core"
import { updateNodeData } from "../../../store/blocks"
import { PixelMode } from "../../../types/enums"

const modes = Object.keys(_PixelMode).filter(
  (key) => !isNaN(Number(_PixelMode[key as PixelMode])),
)

export const PixelBlock = (props: NodeProps<PixelProps>) => {
  const { id } = props.data
  const { data } = props
  const { columns = 9, palette = "base", mode = "Append" } = data

  const [isSettings, toggle] = useReducer((n) => !n, false)

  const pixels =
    data.pixels?.length > 0 ? data.pixels : [...Array(columns * 5)].fill(0)

  function update(input: Partial<PixelProps>) {
    updateNodeData(id, input)

    // Update the behaviour of pixel block.
    if (typeof input.mode === "string") {
      manager.send(id, { SetPixelMode: { mode: input.mode } })
    }
  }

  const isDrawable = !!pixels && columns > 1

  return (
    <div className="group">
      <Handle
        type="target"
        position={Position.Left}
        id="0"
        className="bg-crimson-9 group-hover:bg-cyan-11 hover:!bg-gray-12 hover:border-crimson-9 px-1 py-1 ml-[-1px] border-2 z-10"
      ></Handle>

      <div className="border-2 border-crimson-9 rounded-2 relative hover:border-cyan-9">
        <div
          className="absolute hidden group-hover:flex right-2 top-1 bg-gray-1 p-1 rounded-6 text-cyan-11 hover:bg-cyan-9 hover:text-gray-1"
          onClick={toggle}
        >
          {isSettings ? <EyeClosedIcon /> : <MixerHorizontalIcon />}
        </div>

        <div>
          {!isDrawable && (
            <div className="px-4 py-3 font-mono text-1 text-crimson-10">
              Columns must be more than 1!
            </div>
          )}

          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 20px))`,
            }}
          >
            {isDrawable &&
              pixels?.map((pixel, i) => (
                <div
                  key={i}
                  className="w-5 h-5"
                  style={{ background: getPixelColor(pixel, palette) }}
                />
              ))}
          </div>
        </div>

        {isSettings && (
          <div className="flex flex-col font-mono bg-gray-1">
            <div className="flex flex-col max-w-[160px] gap-y-3 px-3 py-3">
              <div className="flex items-center gap-4">
                <p className="text-1">Columns</p>

                <TextField.Input
                  placeholder="8"
                  value={columns === 0 ? "" : columns.toString()}
                  size="1"
                  min={2}
                  max={16}
                  className="!w-[70px]"
                  onChange={(e) => {
                    const value = parseInt(e.target.value)
                    if (isNaN(value)) return update({ columns: 0 })

                    update({ columns: value })
                  }}
                />
              </div>

              <div className="flex items-center gap-4 w-full">
                <p className="text-1">Palette</p>

                <Select.Root
                  size="1"
                  value={palette}
                  onValueChange={(p) => update({ palette: p as PaletteKey })}
                >
                  <Select.Trigger className="w-[70px]" />

                  <Select.Content>
                    {Object.keys(palettes).map((palette) => (
                      <Select.Item value={palette} key={palette}>
                        {palette}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </div>

              <div className="flex items-center gap-4 w-full">
                <p className="text-1">Behavior</p>

                <Select.Root
                  size="1"
                  value={mode.toString()}
                  onValueChange={(p) => update({ mode: p as PixelMode })}
                >
                  <Select.Trigger className="w-[70px]" />

                  <Select.Content>
                    {modes.map((key) => (
                      <Select.Item value={key} key={key}>
                        {key}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
