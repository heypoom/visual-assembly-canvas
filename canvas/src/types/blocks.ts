import { Waveform } from "./waveform"

import {
  PaletteKey,
  PixelMode,
  MidiInputEvent,
  MidiOutputFormat,
} from "./enums"

export interface BaseProps {
  id: number
}

export interface PixelProps extends BaseProps {
  pixels: number[]
  columns?: number
  palette?: PaletteKey
  mode?: PixelMode
}

export interface TapProps extends BaseProps {
  signal?: number[]
}

export interface MachineProps extends BaseProps {
  source: string
}

export interface PlotterProps extends BaseProps {
  values: number[]

  /** How much data can the plotter hold? */
  size: number
}

export interface PixelProps extends BaseProps {
  pixels: number[]
  columns?: number
  palette?: PaletteKey
  mode?: PixelMode
}

export interface OscProps extends BaseProps {
  time: number
  waveform: Waveform
}

export interface MidiInProps extends BaseProps {
  on: MidiInputEvent
}

export interface MidiOutProps extends BaseProps {
  format: MidiOutputFormat
}
