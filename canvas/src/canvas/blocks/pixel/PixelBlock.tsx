import { useReducer } from "react"
import { Select, TextField } from "@radix-ui/themes"
import { Handle, NodeProps, Position } from "reactflow"

import { PaletteKey, getPixelColor, palettes } from "./palette"

import { PixelBlock } from "../../../types/blocks"
import {
  Cross2Icon,
  EyeClosedIcon,
  MixerHorizontalIcon,
} from "@radix-ui/react-icons"
import { $nodes } from "../../../store/nodes"
import { produce } from "immer"
import { isPixelNode } from ".."

export const PixelBlockView = (props: NodeProps<PixelBlock>) => {
  const { data } = props
  const { columns = 9, palette = "base" } = data

  const [isSettings, toggle] = useReducer((n) => !n, false)

  const pixels =
    data.pixels?.length > 0 ? data.pixels : [...Array(columns * 5)].fill(0)

  function update(input: Partial<PixelBlock>) {
    const next = produce($nodes.get(), (nodes) => {
      const node = nodes.find((n) => n.data.id === data.id)
      if (!node) return

      // Update the pixels.
      if (isPixelNode(node)) {
        node.data = { ...node.data, ...input }
      }
    })

    $nodes.set(next)
  }

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        id="0"
        className="bg-crimson-9 hover:bg-gray-12 hover:border-crimson-9 px-1 py-1 ml-[-1px] border-2 z-10"
      ></Handle>

      <div className="border-2 border-crimson-9 rounded-2 group relative">
        <div
          className="absolute hidden group-hover:flex right-2 top-1 bg-gray-1 p-1 rounded-6 text-crimson-11 hover:bg-crimson-9 hover:text-gray-1"
          onClick={toggle}
        >
          {isSettings ? <EyeClosedIcon /> : <MixerHorizontalIcon />}
        </div>

        <div>
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
          >
            {pixels?.map((pixel, i) => (
              <div
                key={i}
                className="p-2"
                style={{ background: getPixelColor(pixel, palette) }}
              />
            ))}
          </div>
        </div>

        {isSettings && (
          <div className="flex flex-col font-mono">
            <div className="flex flex-col max-w-[160px] gap-y-3 px-3 py-3">
              <div className="flex items-center gap-4">
                <p className="text-1">Columns</p>

                <TextField.Input
                  placeholder="8"
                  value={columns}
                  size="1"
                  min={2}
                  max={16}
                  onChange={(e) => update({ columns: Number(e.target.value) })}
                  className="!w-[70px]"
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
            </div>
          </div>
        )}
      </div>
    </>
  )
}
