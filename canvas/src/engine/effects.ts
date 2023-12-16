import { Effect } from "machine-wasm"

import { processSynthEffect } from "@/services/audio"
import { processMidiEvent } from "@/services/midi"

export function processEffects(effects: Effect[], block: number) {
  for (const effect of effects) {
    if (effect.type === "Midi") {
      processMidiEvent(block, effect).then()
      continue
    }

    if (effect.type === "Synth") {
      processSynthEffect(block, effect)
      continue
    }

    console.warn("unknown effect:", effect)
  }
}
