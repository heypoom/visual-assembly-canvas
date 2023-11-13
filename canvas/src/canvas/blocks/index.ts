import { TapBlockView } from "./TapBlock"
import { OscBlockView } from "./OscBlock"
import { PlotterBlockView } from "./plotter/PlotterBlock"
import { PixelBlockView } from "./pixel/PixelBlock"
import { MachineBlockView } from "./machine/MachineBlock"

import { BlockComponentMap } from "../../types/Node"

export const nodeTypes: BlockComponentMap = {
  Tap: TapBlockView,
  Osc: OscBlockView,
  Plot: PlotterBlockView,
  Pixel: PixelBlockView,
  Machine: MachineBlockView,
}

export * from "./utils/is"
export * from "./utils/defaults"
export * from "./pixel/palette"
