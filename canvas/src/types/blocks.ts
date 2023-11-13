import { PixelMode as _PixelMode } from "machine-wasm"

import { UnionToIntersection } from "./helper"

import { PaletteKey } from "../canvas/blocks"

export interface BaseBlock {
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
  source: string
}

export interface PlotterBlock extends BaseBlock {
  values: number[]

  /** How much data can the plotter hold? */
  size: number
}

export type Waveform =
  | { Sine: null }
  | { Cosine: null }
  | { Tangent: null }
  | { Square: { duty_cycle: number } }
  | { Sawtooth: null }
  | { Triangle: null }
  | { Noise: null }

export type WaveformKey = keyof UnionToIntersection<Waveform>

export interface OscBlock extends BaseBlock {
  time: number
  waveform: Waveform
}
