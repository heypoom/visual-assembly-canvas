import { MidiOutputFormat } from "./enums"
import { SynthTrigger } from "./synth"

export interface MidiEffect {
  Midi: {
    format: MidiOutputFormat
    data: number[]
    channel: number
    port: number
  }
}

export interface SynthEffect {
  Synth: {
    target: number
    triggers: SynthTrigger[]
  }
}

export type PrintEffect = { Print: { text: string } }

export type Effect = MidiEffect | PrintEffect | SynthEffect
