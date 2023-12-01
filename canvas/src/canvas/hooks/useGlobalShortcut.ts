import { useHotkeys } from "react-hotkeys-hook"
import { scheduler } from "../../services/scheduler"
import { engine } from "../../engine"

export function useGlobalShortcut() {
  useHotkeys("p", () => {
    scheduler.toggle()
  })

  useHotkeys("s", () => {
    engine.stepSlow(1)
  })

  useHotkeys("r", () => {
    engine.reset()
  })
}
