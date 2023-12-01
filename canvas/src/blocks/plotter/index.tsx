import { useEffect, useReducer, useRef } from "react"
import { Handle, NodeProps, Position } from "reactflow"
import { cyanP3 } from "@radix-ui/colors"

import { rescale } from "./rescale"

import { RightClickMenu } from "../components/RightClickMenu"
import { PlotterProps } from "../../types/blocks"

const S0 = 0

export const PlotterBlock = (props: NodeProps<PlotterProps>) => {
  const { id, values, size } = props.data
  const [showSettings, toggle] = useReducer((n) => !n, false)

  const scaleY = 2
  const max = 255

  const ref = useRef<HTMLCanvasElement>(null)
  const plotted = rescale(values, max)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    ctx.strokeStyle = cyanP3.cyan9
    ctx.fillStyle = cyanP3.cyan9
    ctx.lineWidth = 4
    ctx.clearRect(0, 0, width, height)

    ctx.beginPath()
    ctx.moveTo(0, height - plotted[0] / scaleY)

    plotted.forEach((value, i) => {
      ctx.lineTo((i / plotted.length) * width, height - value / scaleY)
    })

    ctx.stroke()
  }, [plotted])

  return (
    <div>
      <Handle
        type="target"
        position={Position.Left}
        id={S0.toString()}
        className="bg-cyan-9 group-hover:bg-cyan-11 hover:!bg-gray-12 hover:border-cyan-9 px-1 py-1 ml-[-1px] border-2 z-10"
      />

      <RightClickMenu id={id} toggle={toggle} show={showSettings}>
        <div className="group">
          {typeof size !== "number" && <div>error: missing size!</div>}

          <div
            className="flex border-2 border-cyan-9 h-[80px]"
            style={{ minWidth: `${size + 2}px` }}
          >
            <canvas ref={ref} className="w-full" />
          </div>
        </div>
      </RightClickMenu>
    </div>
  )
}
