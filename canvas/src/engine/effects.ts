import { Effect } from "machine-wasm"

import { processSynthEffect } from "@/services/audio"
import { processMidiEvent } from "@/services/midi"

export function processEffects(effects: Effect[], block: number) {
  for (const effect of effects) {
    switch (effect.type) {
      case "Midi":
        processMidiEvent(block, effect).then()
        break
      case "Synth":
        processSynthEffect(block, effect)
        break
      case "Sleep":
        console.log("[SLEEP]", effect.duration)
        break
      default:
        console.warn("unknown effect:", effect)
    }
  }
}
