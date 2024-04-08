import { Effect } from "machine-wasm"

import { engine } from "@/engine"

export function processSleepEffect(id: number, effect: Effect) {
  if (effect.type !== "Sleep") return

  setTimeout(() => engine.ctx.wake(id), effect.ms)
}
