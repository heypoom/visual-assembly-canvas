export interface BaseBlock {
  // Machine identifier.
  id: number
}

export interface PixelBlock extends BaseBlock {
  pixels: number[]
}

export interface MachineBlock extends BaseBlock {
  // Current source code of the machine.
  source: string
}
