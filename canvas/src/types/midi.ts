import { MidiOutputFormat } from "machine-wasm"

export type MidiOutputEvent =
  | { Setup: { formats: MidiOutputFormat[] } }
  | { Raw: { message: number[] } }
  | { Note: { note: number; velocity: number } }
  | { ControlChange: { control: number; value: number } }
