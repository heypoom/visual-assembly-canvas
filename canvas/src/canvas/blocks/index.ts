import { TapBlockView } from "./TapBlock"
import { OscBlockView } from "./OscBlock"
import { PlotterBlockView } from "./plotter/PlotterBlock"
import { PixelBlockView } from "./pixel/PixelBlock"
import { MachineBlockView } from "./machine/MachineBlock"

import { BlockComponentMap } from "../../types/Node"

export const nodeTypes: BlockComponentMap = {
  tap: TapBlockView,
  osc: OscBlockView,
  plotter: PlotterBlockView,
  pixel: PixelBlockView,
  machine: MachineBlockView,
}

export * from "./utils/is"
