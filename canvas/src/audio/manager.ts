import { AMSynth, FMSynth, NoiseSynth, Synth } from "tone"
import * as Tone from "tone"

import { AttackReleaseConfig, SynthConfig, SynthType } from "../types/synth"
import { Instrument } from "tone/build/esm/instrument/Instrument"

const synthMap: Record<SynthType, () => Instrument<any>> = {
  Basic: () => new Synth().toDestination(),
  FM: () => new FMSynth().toDestination(),
  AM: () => new AMSynth().toDestination(),
  Noise: () => new NoiseSynth().toDestination(),
  Poly: () => new Synth().toDestination(),
}

export class AudioManager {
  isReady = false

  synths: Map<number, Instrument<any>> = new Map()

  async ready() {
    if (this.isReady) return

    await Tone.start()
  }

  setup(id: number, config: SynthConfig) {
    if (this.synths.has(id)) return

    const key = Object.keys(config)[0] as SynthType
    const createSynth = synthMap[key]
    this.synths.set(id, createSynth())
  }

  attackRelease(id: number, config: AttackReleaseConfig) {
    const synth = this.synths.get(id)
    console.log(id, config)

    if (!synth) return

    const time = Tone.now() + config.time
    synth.triggerAttackRelease(config.freq, config.duration, time)
  }
}

export const audioManager = new AudioManager()

// @ts-ignore
window.audioManager = audioManager
