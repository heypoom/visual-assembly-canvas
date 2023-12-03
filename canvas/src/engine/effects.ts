import { processSynthEffect } from "@/services/audio"
import { processMidiEvent } from "@/services/midi"
import { Effect } from "@/types/effects"

export function processEffects(effects: Effect[], block: number) {
  for (const effect of effects) {
    if ("Midi" in effect) {
      processMidiEvent(block, effect).then()
      continue
    }

    if ("Synth" in effect) {
      processSynthEffect(block, effect)
      continue
    }

    console.warn("unknown effect:", effect)
  }
}
