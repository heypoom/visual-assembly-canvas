import { BlockTypeMap, BlockTypes } from "@/types/Node"

export const DEFAULT_SOURCE = "push 0xAA\n\n\n\n"

export type DefaultPropsMap = {
  [T in BlockTypes]: Omit<BlockTypeMap[T], "id">
}

export const defaultProps: DefaultPropsMap = {
  Machine: { source: DEFAULT_SOURCE },
  Plot: { values: [], size: 250 },
  Clock: { time: 0, freq: 0, ping: false },
  Pixel: { pixels: [], mode: "Append" },
  Tap: { signal: [1] },
  Osc: { waveform: { Sine: null } },
  Synth: { config: { Basic: null } },
  MidiIn: { on: "NoteOn", port: 0, channels: [] },
  MidiOut: { format: "Note", channel: 1, port: 0 },
  Memory: { values: [], auto_reset: false },
}
