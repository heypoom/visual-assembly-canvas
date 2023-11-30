import { useCallback, useEffect, useMemo, useState } from "react"
import { getMatchedCommands, useCommandRunner } from "../commands/commands"
import { useHotkeys } from "react-hotkeys-hook"

type Pos = { x: number; y: number } | null

export function Insert() {
  const [command, setCommand] = useState("")
  const [cursor, setCursor] = useState<Pos>(null)
  const [active, setActive] = useState(false)

  const { run } = useCommandRunner()

  const matches = useMemo(() => getMatchedCommands(command), [command])

  useHotkeys("/", () => {
    setActive(!active)
  })

  useHotkeys("esc", () => {
    disable()
  })

  function disable() {
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

  return (
    <div>
      <div
        className="fixed font-mono px-4 py-3 bg-gray-5 rounded-3"
        style={{ top: `${top}px`, left: `${left}px` }}
      >
        <input
          className="bg-transparent text-4 outline-none"
          value={command}
          autoFocus
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (matches.length === 0) return

              const [match] = matches

              const ok = run(match, { position: cursor })
              if (ok) disable()
            }
          }}
        />

        <div>
          {matches.map((preview) => (
            <div key={preview.prefix} className="flex gap-x-2">
              <div className="text-2">/{preview.prefix}</div>
              <div className="text-2">{preview.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
