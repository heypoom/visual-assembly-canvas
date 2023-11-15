import { Waveform } from "./waveform"
import { MidiInputEvent, MidiOutputFormat, PixelMode } from "./enums"

export interface MidiAction {
  Midi: {
    event: MidiInputEvent
    note: number
    value: number
    channel: number
    port: number
  }
}

export type Action =
  | { Data: { body: number[] } }
  | { Reset: null }
  | MidiAction
  | { SetMidiPort: { port: number } }
  | { SetMidiChannels: { channels: number[] } }
  | { SetMidiOutputFormat: { format: MidiOutputFormat } }
  | { SetWaveform: { waveform: Waveform } }
  | { SetPixelMode: { mode: PixelMode } }
