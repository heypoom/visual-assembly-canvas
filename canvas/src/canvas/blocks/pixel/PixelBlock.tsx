import { Handle, NodeProps, Position } from "reactflow"

import { getPixelColor } from "./palette"

import { PixelBlock } from "../../../types/blocks"

export const PixelBlockView = (props: NodeProps<PixelBlock>) => {
  const { data } = props
  const { columns = 9, palette = "base" } = data

  const pixels =
    data.pixels?.length > 0 ? data.pixels : [...Array(columns * 5)].fill(0)

  return (
    <div className="">
      <Handle
        type="target"
        position={Position.Left}
        id="0"
        className="bg-crimson-9 px-1 py-1 ml-[-1px] border-2"
      ></Handle>

      <div className="border-2 border-crimson-9 rounded-2">
        <div
          className="grid"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
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
    </div>
  )
}
