import { TapBlockView } from "./TapBlock"
import { OscBlockView } from "./OscBlock"
import { PlotterBlockView } from "./plotter/PlotterBlock"
import { PixelBlockView } from "./pixel/PixelBlock"
import { MachineBlockView } from "./machine/MachineBlock"

import { BlockComponentMap } from "../../types/Node"

export const nodeTypes: BlockComponentMap = {
  TapBlock: TapBlockView,
  OscBlock: OscBlockView,
  PlotterBlock: PlotterBlockView,
  PixelBlock: PixelBlockView,
  MachineBlock: MachineBlockView,
}

export * from "./utils/is"
