import { MidiOutputFormat } from "./enums"

export type MidiEffect = { Midi: { format: MidiOutputFormat; data: number[] } }
export type PrintEffect = { Print: { text: string } }

export type Effect = MidiEffect | PrintEffect
