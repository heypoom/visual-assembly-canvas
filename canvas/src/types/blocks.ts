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

  // Capacity of the plotter
  size: number
}

export type Waveform =
  | { Sine: null }
  | { Square: { duty_cycle: number } }
  | { Sawtooth: null }
  | { Triangle: null }
  | { Noise: null }

export interface OscBlock extends BaseBlock {
  time: number
  values: number[]
  waveform: Waveform
}

