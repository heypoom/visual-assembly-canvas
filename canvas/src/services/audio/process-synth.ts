import { SynthEffect } from "@/types/effects"

import { audioManager } from "./manager"

export function processSynthEffect(id: number, effect: SynthEffect) {
  const { triggers } = effect.Synth

  for (const trigger of triggers) {
    if ("AttackRelease" in trigger) {
      audioManager.attackRelease(id, trigger.AttackRelease)
    }
  }
}
