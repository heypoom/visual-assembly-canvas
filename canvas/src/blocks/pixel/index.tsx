import { TextField } from "@radix-ui/themes"
import { PixelMode } from "machine-wasm"
import { useEffect, useRef } from "react"

import { BaseBlock, getPixelColor, PaletteKey, paletteOptions } from "@/blocks"
import { engine } from "@/engine"
import { BlockPropsOf } from "@/types/Node"
import { RadixSelect } from "@/ui"

const modes: PixelMode[] = ["Append", "Replace", "Command"]

const modeOptions = modes.map((value) => ({ value, label: value }))

const BLOCK_SIZE = 22

type PixelProps = BlockPropsOf<"Pixel">
type PixelData = PixelProps["data"]

export const PixelBlock = (props: PixelProps) => {
  const { id } = props.data
  const { data } = props
  const { columns = 9, palette = "base", mode = "Append" } = data

  const canvasRef = useRef<HTMLCanvasElement | null>()

  const pixels =
    data.pixels?.length > 0 ? data.pixels : [...Array(columns * 5)].fill(0)

  const update = (input: Partial<PixelData>) =>
    engine.setBlock(id, "Pixel", input)

  const rows = Math.round(pixels.length / columns)
  const isDrawable = !!pixels && columns > 1

  const width = columns * BLOCK_SIZE
  const height = rows * BLOCK_SIZE

  useEffect(() => {
    const canvas = canvasRef.current

    const ctx = canvas?.getContext("2d")
    if (!ctx || !canvas) return

    const rect = canvas?.getBoundingClientRect()

    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const size = canvas.width / columns / dpr

    for (let i = 0; i < pixels.length; i++) {
      const x = i % columns
      const y = Math.floor(i / columns)

      ctx.fillStyle = getPixelColor(pixels[i], palette)
      ctx.fillRect(x * size, y * size, size, size)
    }
  }, [pixels, columns, palette])

  const Settings = () => (
    <div className="flex flex-col font-mono bg-gray-1">
      <div className="flex flex-col max-w-[200px] gap-y-3 px-3 py-3">
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

          <RadixSelect
            value={palette}
            onChange={(p) => update({ palette: p as PaletteKey })}
            options={paletteOptions}
          />
        </div>

        <div className="flex items-center gap-4 w-full">
          <p className="text-1">Behavior</p>

          <RadixSelect
            value={mode.toString()}
            onChange={(p) => update({ mode: p as PixelMode })}
            options={modeOptions}
          />
        </div>
      </div>
    </div>
  )

  return (
    <BaseBlock node={props} targets={1} settings={Settings}>
      {isDrawable ? (
        <div
          className="w-full"
          style={{ height: `${height}px`, maxWidth: `${width}px` }}
        >
          <canvas
            ref={(r) => (canvasRef.current = r)}
            className="h-[180px] w-full"
            style={{ height, minWidth: width }}
          />
        </div>
      ) : (
        <div className="px-4 py-3 font-mono text-1 text-tomato-11">
          There must be at least two columns.
        </div>
      )}
    </BaseBlock>
  )
}
