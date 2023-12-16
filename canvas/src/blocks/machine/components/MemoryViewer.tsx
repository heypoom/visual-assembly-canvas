import cn from "classnames"
import { memo, useRef, useState } from "react"

export interface ViewerConfig {
  hex?: boolean
  showAddress?: boolean
  minDigits?: number
  columns?: number
  rows?: number
}

interface Props {
  memory: number[]
  begin?: number
  center?: boolean

  config?: ViewerConfig

  onHover?: (address: number | null) => void
}

const HOLD_MS = 100

export const MemoryViewer = memo((props: Props) => {
  const { memory, begin = 0, config, center } = props

  const {
    columns = 8,
    rows = 8,
    hex = true,
    showAddress = false,
    minDigits = 4,
  } = config ?? {}

  const aborted = useRef(false)

  const [start, setStart] = useState<number | null>(null)
  const [end, setEnd] = useState<number | null>(null)
  const [selecting, setSelecting] = useState(false)

  if (!memory?.length) return null

  const startDrag = (i: number) => {
    aborted.current = false

    setTimeout(() => {
      if (aborted.current) return

      setStart(i)
      setEnd(null)
      setSelecting(true)
    }, HOLD_MS)
  }

  const base = hex ? 16 : 10
  const pad = hex ? minDigits : minDigits + 1

  const show = (n: number) => n.toString(base).padStart(pad, "0").toUpperCase()

  return (
    <div className="flex text-[10px]">
      {showAddress && (
        <div className="flex flex-col text-gray-9">
          {[...Array(rows)].map((_, n) => {
            return (
              <div>
                {hex ? "0x" : ""}
                {show(begin + n * columns)}
              </div>
            )
          })}
        </div>
      )}

      <div
        className={cn("px-1 grid nodrag", center && "w-full")}
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        onMouseLeave={() => {
          if (selecting) setSelecting(false)
          if (props.onHover) props.onHover(null)
        }}
      >
        {memory.map((u, i) => {
          const value = show(u)

          const selected =
            start !== null && end !== null && i >= start && i <= end

          const inner = (
            <div
              key={i}
              onMouseDown={() => startDrag(i)}
              onMouseOver={() => {
                if (props.onHover) {
                  props.onHover(begin + i)
                }

                if (selecting && start !== null) {
                  if (i > start) {
                    setEnd(i)
                  }
                }
              }}
              onMouseUp={() => {
                setSelecting(false)
                aborted.current = true
              }}
              className={cn(
                "select-none text-crimson-11 bg-stone-800 px-1",
                !selected && u === 0 && "text-gray-8",
                selected && "bg-yellow-5 text-yellow-11 hover:text-yellow-12",
                !selected && "hover:text-crimson-12",
                center && "text-center",
              )}
            >
              {value}
            </div>
          )

          return inner
        })}
      </div>
    </div>
  )
})
