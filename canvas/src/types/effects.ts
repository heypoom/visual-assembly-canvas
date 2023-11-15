import { MidiOutputFormat } from "./enums"

export interface MidiEffect {
  Midi: {
    format: MidiOutputFormat
    data: number[]
    channel: number
    port: number
  }
}

export type PrintEffect = { Print: { text: string } }

export type Effect = MidiEffect | PrintEffect
