import { TapBlockView } from "./TapBlock"
import { PixelBlockView } from "./pixel/PixelBlock"
import { MachineBlockView } from "./machine/MachineBlock"

import { BlockComponentMap } from "../../types/Node"

export const nodeTypes: BlockComponentMap = {
  tap: TapBlockView,
  pixel: PixelBlockView,
  machine: MachineBlockView,
}

export * from "./utils/is"
