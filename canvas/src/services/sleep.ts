import { Effect } from "machine-wasm"

import { engine } from "@/engine"

export function processSleepEffect(id: number, effect: Effect) {
  if (effect.type !== "Sleep") return

  const { duration } = effect

  if (duration.type === "Tick") {
    // tick sleep logic - count n ticks before sleep?
  }

  if (duration.type === "Ms") {
    // ms sleep logic
    setTimeout(() => {
      engine.ctx.wake(id)
    }, duration.value)
  }
}
