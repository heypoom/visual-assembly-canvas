import { useCallback, useEffect, useState } from "react"
import { insertCommand, useInsertCommand } from "../commands/insert"
import { useHotkeys } from "react-hotkeys-hook"

type Pos = { x: number; y: number } | null

export function Insert() {
  const [command, setCommand] = useState("")
  const [cursor, setCursor] = useState<Pos>(null)
  const [active, setActive] = useState(false)

  const { insertCommand } = useInsertCommand()

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
              const match = insertCommand(command, { position: cursor })
              if (match) disable()
            }
          }}
        />
      </div>
    </div>
  )
}
