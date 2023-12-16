import cn from "classnames"
import { memo, useMemo, useRef, useState } from "react"

import { findLastNonZeroIndex } from "@/utils/findLastNonZero"

interface Props {
  memory: number[]
}

const HOLD_MS = 100

export const SmallMemoryViewer = memo((props: Props) => {
  const { memory } = props

  const aborted = useRef(false)

  const [start, setStart] = useState<number | null>(null)
  const [end, setEnd] = useState<number | null>(null)
  const [selecting, setSelecting] = useState(false)

  const lastStackValueIndex = useMemo(() => {
    return findLastNonZeroIndex(memory ?? [])
  }, [memory])

  const isMemoryEnabled = lastStackValueIndex > -1

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
        const unset = i > lastStackValueIndex
        if (unset) return null

        const value = u.toString().padStart(2, "0")

        const selected =
          start !== null && end !== null && i >= start && i <= end

        return (
          <div className="select-none" key={i}>
            <div
              onMouseDown={() => startDrag(i)}
              onMouseOver={() => {
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
                "text-1 text-crimson-11 bg-stone-800 px-1",
                u === 0 && "text-gray-8",
                selected && "bg-yellow-5 text-yellow-11 hover:text-yellow-12",
                !selected && "hover:text-crimson-12",
              )}
            >
              {value}
            </div>
          </div>
        )
      })}
    </div>
  )
})
