import {
  MidiInputEvent as _MidiInputEvent,
  MidiOutputFormat as _MidiOutputFormat,
  PixelMode as _PixelMode,
} from "machine-wasm"

export type PixelMode = keyof typeof _PixelMode
export type MidiInputEvent = keyof typeof _MidiInputEvent
export type MidiOutputFormat = keyof typeof _MidiOutputFormat
