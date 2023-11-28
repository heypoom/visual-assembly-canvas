import { AMSynth, FMSynth, NoiseSynth, Synth } from "tone"

import { SynthConfig, SynthType } from "../types/synth"
import { Instrument } from "tone/build/esm/instrument/Instrument"

const synthMap: Record<SynthType, () => Instrument<any>> = {
  Basic: () => new Synth(),
  FM: () => new FMSynth(),
  AM: () => new AMSynth(),
  Noise: () => new NoiseSynth(),
  Poly: () => new Synth(),
}

export class AudioManager {
  synths: Map<number, Instrument<any>> = new Map()

  setup(id: number, config: SynthConfig) {
    if (this.synths.has(id)) return

    const key = Object.keys(config)[0] as SynthType
    const createSynth = synthMap[key]
    this.synths.set(id, createSynth())
  }
}

export const audioManager = new AudioManager()
