import { processSynthEffect } from "@/services/audio/process-synth"
import { processMidiEvent } from "@/services/midi/event"
import { Effect } from "@/types/effects"

export function processEffects(effects: Effect[], block: number) {
  for (const effect of effects) {
    if ("Midi" in effect) return processMidiEvent(block, effect).then()
    if ("Synth" in effect) return processSynthEffect(block, effect)

    console.warn("unknown effect:", effect)
  }
}
