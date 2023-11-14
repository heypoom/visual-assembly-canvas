import { TapBlock } from "./tap"
import { OscBlock } from "./osc"
import { PlotterBlock } from "./plotter"
import { PixelBlock } from "./pixel"
import { MachineBlock } from "./machine"
import { ClockBlock } from "./clock"
import { MidiInBlock, MidiOutBlock } from "./midi"

import { BlockComponentMap } from "../../types/Node"

export const nodeTypes: BlockComponentMap = {
  Tap: TapBlock,
  Osc: OscBlock,
  Clock: ClockBlock,
  Plot: PlotterBlock,
  Pixel: PixelBlock,
  Machine: MachineBlock,
  MidiIn: MidiInBlock,
  MidiOut: MidiOutBlock,
}

export * from "./utils/is"
export * from "./utils/defaults"
export * from "./pixel/palette"
