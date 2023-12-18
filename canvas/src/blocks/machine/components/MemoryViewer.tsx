import { DragOverlay, useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
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
  id: number
  memory: number[]
  begin?: number
  full?: boolean

  config?: ViewerConfig

  onHover?: (address: number | null) => void
  onConfirm?: (start: number, end: number) => void
  onDrag?: (transfer: DataTransfer, start: number, end: number) => void
}

const HOLD_MS = 100

export const MemoryViewer = memo((props: Props) => {
  const { id, memory, begin = 0, config, full } = props

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

  const [canDragOut, setCanDragOut] = useState(false)

  const draggable = useDraggable({
    id: `mem-${id}`,
    disabled: !canDragOut,
    data: { foo: "bar" },
  })

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

  function confirm() {
    setSelecting(false)

    if (props.onConfirm && start !== null && end !== null) {
      props.onConfirm(start, end)
    }
  }

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
        ref={draggable.setNodeRef}
        className={cn("px-1 grid nodrag", full && "w-full")}
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          transform: CSS.Translate.toString(draggable.transform),
        }}
        onMouseLeave={() => {
          setCanDragOut(false)
          if (selecting) confirm()
          props.onHover?.(null)
        }}
        // onDragStart={(event) => {
        //   if (start !== null && end !== null) {
        //     props.onDrag?.(event.dataTransfer, start, end)
        //   }
        // }}
        onDragEnd={() => setCanDragOut(false)}
        {...draggable.listeners}
        {...draggable.attributes}
      >
        {memory.map((u, i) => {
          const value = show(u)

          const selected =
            start !== null && end !== null && i >= start && i <= end

          return (
            <div
              key={i}
              onMouseDown={(e) => {
                if (e.metaKey && selected) {
                  setCanDragOut(true)
                  return
                }

                setCanDragOut(false)
                startDrag(i)
              }}
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
                confirm()
                aborted.current = true
              }}
              className={cn(
                "select-none text-crimson-11 bg-stone-800 px-1",
                !selected && u === 0 && "text-gray-8",
                selected && "bg-yellow-5 text-yellow-11 hover:text-yellow-12",
                !selected && "hover:text-crimson-12",
                full && "text-center",
                (canDragOut || draggable.isDragging) &&
                  !selected &&
                  "opacity-0 bg-transparent",
              )}
            >
              {value}
            </div>
          )
        })}
      </div>

      <DragOverlay>{draggable.isDragging && <div>woah</div>}</DragOverlay>
    </div>
  )
})
