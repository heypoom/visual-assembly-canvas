export interface BaseBlock {
  // Machine identifier.
  id: number
}

export interface PixelArtBlock extends BaseBlock {
  pixels: number[]
}

export interface MachineBlock extends BaseBlock {
  // Current source code of the machine.
  source: string
}
