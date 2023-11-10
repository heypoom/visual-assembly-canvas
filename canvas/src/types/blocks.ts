import { PaletteKey } from "../canvas/blocks/pixel/palette"

export interface BaseBlock {
  // Machine identifier.
  id: number
}

export interface PixelBlock extends BaseBlock {
  pixels: number[]
  columns?: number
  palette?: PaletteKey
}

export interface MachineBlock extends BaseBlock {
  // Current source code of the machine.
  source: string
}
