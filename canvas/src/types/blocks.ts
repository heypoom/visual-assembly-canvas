import { PixelMode as _PixelMode } from "machine-wasm"

import { PaletteKey } from "../canvas/blocks/pixel/palette"

export interface BaseBlock {
  // Machine identifier.
  id: number
}

export type PixelMode = keyof typeof _PixelMode

export interface PixelBlock extends BaseBlock {
  pixels: number[]
  columns?: number
  palette?: PaletteKey
  mode?: PixelMode
}

export interface TapBlock extends BaseBlock {
  signal?: number[]
}

export interface MachineBlock extends BaseBlock {
  // Current source code of the machine.
  source: string
}

export interface PlotterBlock extends BaseBlock {
  // Data to plot.
  data: number[]
}

export type Waveform =
  | { Sine: {} }
  | { Square: { duty_cycle: number } }
  | { Sawtooth: {} }
  | { Triangle: {} }
  | { Noise: {} }

export interface OscBlock extends BaseBlock {
  time: number
  values: number[]
  waveform: Waveform
}

