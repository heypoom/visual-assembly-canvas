import { Handle, NodeProps, Position } from "reactflow"
import { PixelBlock } from "../../types/blocks"

const PIXEL_COLORS: string[] = ["pink", "teal", "yellow", "pink"]

const getPixelColor = (pixel: number): string => PIXEL_COLORS[pixel] ?? "white"

export const PixelBlockView = (props: NodeProps<PixelBlock>) => {
  const { pixels } = props.data
  console.log("pixels:", pixels)

  return (
    <div className="">
      <Handle
        type="target"
        position={Position.Left}
        id="0"
        className="bg-crimson-9 px-1 py-1 ml-[-1px] border-2"
      ></Handle>

      <div className="px-3 py-3 border-2 border-crimson-9 rounded-2">
        <div className="grid grid-cols-6">
          {pixels?.map((pixel) => (
            <div className="p-2" style={{ background: getPixelColor(pixel) }} />
          ))}
        </div>
      </div>
    </div>
  )
}
