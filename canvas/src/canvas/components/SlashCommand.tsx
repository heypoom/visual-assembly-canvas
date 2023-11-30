import { useCallback, useEffect, useMemo, useState } from "react"
import { getMatchedCommands, useCommandRunner } from "../commands/commands"
import { useHotkeys } from "react-hotkeys-hook"
import cn from "classnames"
import { useReactFlow } from "reactflow"

type Pos = { x: number; y: number } | null

export function SlashCommand() {
  const [command, setCommand] = useState("")
  const [cursor, setCursor] = useState<Pos>(null)
  const [active, setActive] = useState(false)
  const [selected, setSelected] = useState(0)

  const { run } = useCommandRunner()
  const flow = useReactFlow()

  const matches = useMemo(() => getMatchedCommands(command), [command])

  useHotkeys("/", () => {
    setActive((active) => !active)
  })

  function hide() {
    setActive(false)
    setCommand("")
  }

  const onMouseMove = useCallback((event: MouseEvent) => {
    return setCursor({ x: event.clientX, y: event.clientY })
  }, [])

  const destroy = useCallback(() => {
    window.removeEventListener("mousemove", onMouseMove)
  }, [])

  const register = useCallback(() => {
    window.addEventListener("mousemove", onMouseMove)
  }, [])

  useEffect(() => {
    register()

    return () => {
      destroy()
    }
  }, [active])

  if (!cursor) return null
  if (!active) return null

  const top = cursor.y - 25
  const left = cursor.x - 20

  const noMatches = matches.length === 0

  return (
    <div>
      <div
        className="flex flex-col fixed font-mono py-3 bg-gray-2 rounded-3 gap-y-2"
        style={{ top: `${top}px`, left: `${left}px` }}
      >
        <input
          className={cn(
            "bg-transparent text-4 outline-none px-4",
            noMatches && "text-red-11",
          )}
          value={command}
          autoFocus
          onChange={(e) => {
            setSelected(0)
            setCommand(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault()

              setSelected((s) => {
                if (s >= matches.length - 1) return 0

                return s + 1
              })

              return
            }

            if (e.key === "ArrowUp") {
              e.preventDefault()

              setSelected((s) => {
                if (s <= 0) return matches.length - 1

                return s - 1
              })

              return
            }

            if (e.key === "Enter") {
              if (matches.length === 0) return

              const position = flow.project(cursor)
              const ok = run(matches[selected], { position })
              if (ok) hide()

              return
            }

            if (e.key === "Escape") {
              hide()
              return
            }
          }}
        />

        {matches.length > 0 && (
          <div className="flex flex-col">
            {matches.map((preview, i) => (
              <div
                key={preview.prefix}
                className={cn(
                  "flex items-center justify-between gap-x-2 px-4 py-[3px]",
                  preview.destructive && "text-red-11",
                  selected === i && "text-green-11 bg-gray-3",
                )}
              >
                <div>
                  <div className="text-2">/{preview.prefix}</div>
                </div>

                <div>
                  <div className="text-2">{preview.name}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
