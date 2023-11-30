import {
  PixelMode as _PixelMode,
  MidiInputEvent as _MidiInputEvent,
  MidiOutputFormat as _MidiOutputFormat,
} from "machine-wasm"

export type { PaletteKey } from "../blocks"

export type PixelMode = keyof typeof _PixelMode
export type MidiInputEvent = keyof typeof _MidiInputEvent
export type MidiOutputFormat = keyof typeof _MidiOutputFormat
