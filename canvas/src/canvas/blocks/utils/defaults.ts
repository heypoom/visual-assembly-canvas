import { BlockTypes, BlockTypeMap } from "../../../types/Node"

export const DEFAULT_SOURCE = "push 0xAA\n\n\n\n"

export type DefaultPropsMap = {
  [T in BlockTypes]: Omit<BlockTypeMap[T], "id">
}

export const defaultProps: DefaultPropsMap = {
  Machine: { source: DEFAULT_SOURCE },
  Pixel: { pixels: [], mode: "Append" },
  Tap: { signal: [1] },
  Osc: { time: 0, waveform: { Sine: null } },
  Plot: { values: [], size: 250 },
  MidiIn: { event: "NoteOn" },
  MidiOut: { format: "Note" },
}
