import { BlockTypes, BlockTypeMap } from "../../../types/Node"

export const DEFAULT_SOURCE = "push 0xAA\n\n\n\n"

export type DefaultPropsMap = {
  [T in BlockTypes]: Omit<BlockTypeMap[T], "id">
}

export const defaultProps: DefaultPropsMap = {
  MachineBlock: { source: DEFAULT_SOURCE },
  PixelBlock: { pixels: [], mode: "Replace" },
  TapBlock: { signal: [1] },
  OscBlock: { time: 0, waveform: { Sine: null } },
  PlotterBlock: { values: [], size: 250 },
}
