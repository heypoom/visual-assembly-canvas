import cn from "classnames"
import { useMemo, useRef, useState } from "react"

import { findLastNonZeroIndex } from "@/utils/findLastNonZero"

interface Props {
  memory: number[]
}

const HOLD_MS = 200

export const SmallMemoryViewer = (props: Props) => {
  const { memory } = props

  const aborted = useRef(false)

  const [start, setStart] = useState<number | null>(null)
  const [end, setEnd] = useState<number | null>(null)
  const [selecting, setSelecting] = useState(false)

  const lastStackValue = useMemo(() => {
    return findLastNonZeroIndex(memory ?? [])
  }, [memory])

  const isMemoryEnabled = lastStackValue > -1

  if (!memory?.length || !isMemoryEnabled) return null

  const startDrag = (i: number) => {
    aborted.current = false

    setTimeout(() => {
      if (aborted.current) return

      setStart(i)
      setEnd(null)
      setSelecting(true)
    }, HOLD_MS)
  }

  return (
    <div
      className="px-1 flex flex-wrap max-w-[300px] nodrag"
      onMouseLeave={() => {
        if (selecting) setSelecting(false)
      }}
    >
      {memory.map((u, i) => {
        const unset = i > lastStackValue
        if (unset) return null

        const value = u.toString().padStart(2, "0")

        const isStart = i === start
        const isEnd = i === end

        const selected =
          start !== null && end !== null && i >= start && i <= end

        return (
          <div className="select-none" key={i}>
            <div
              onMouseDown={() => startDrag(i)}
              onMouseOver={() => {
                if (selecting) setEnd(i)
              }}
              onMouseUp={() => {
                setSelecting(false)
                aborted.current = true
              }}
              className={cn(
                "text-1 text-crimson-11 bg-stone-800 px-1",
                "hover:text-green-11",
                isStart && "rounded-l-1",
                isEnd && "rounded-r-1",
                (isStart || selected || isEnd) &&
                  "text-yellow-11 hover:text-yellow-12",
                selected && "bg-yellow-5",
                u === 0 && "text-gray-8",
              )}
            >
              {value}
            </div>
          </div>
        )
      })}
    </div>
  )
}
