import {
  start,
  now,
  PolySynth,
  AMSynth,
  FMSynth,
  NoiseSynth,
  Synth,
} from "tone"

import { AttackReleaseConfig, SynthConfig, SynthType } from "@/types/synth"
import type { Instrument } from "tone/build/esm/instrument/Instrument"

const synthMap: Record<SynthType, () => Instrument<any>> = {
  Basic: () => new PolySynth(Synth).toDestination(),
  FM: () => new PolySynth(FMSynth).toDestination(),
  AM: () => new PolySynth(AMSynth).toDestination(),
  Noise: () => new NoiseSynth().toDestination(),
}

export class AudioManager {
  isReady = false

  synths: Map<number, Instrument<any>> = new Map()

  async ready() {
    if (this.isReady) return

    await start()
  }

  add(id: number, config: string | SynthConfig) {
    if (this.synths.has(id)) return

    const key = typeof config === "string" ? config : Object.keys(config)[0]
    const createSynth = synthMap[key as SynthType]

    this.synths.set(id, createSynth())
  }

  attackRelease(id: number, config: AttackReleaseConfig) {
    const synth = this.synths.get(id)

    if (!synth) return

    const time = now() + config.time
    synth.triggerAttackRelease(config.freq, config.duration, time)
  }
}

export const audioManager = new AudioManager()

// @ts-ignore
window.audioManager = audioManager
