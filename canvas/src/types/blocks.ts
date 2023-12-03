import { PaletteKey } from "@/blocks"

import { MidiInputEvent, MidiOutputFormat, PixelMode } from "./enums"
import { SynthConfig } from "./synth"
import { Waveform } from "./waveform"

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
  waveform: Waveform
}

export interface ClockProps extends BaseProps {
  time: number
  freq: number
  ping: boolean
}

export interface MidiInProps extends BaseProps {
  on: MidiInputEvent

  port: number

  /** Accept all channels if empty. Otherwise, only accept filtered channels. */
  channels: number[]
}

export interface MidiOutProps extends BaseProps {
  format: MidiOutputFormat

  port: number
  channel: number
}

export interface SynthProps extends BaseProps {
  config: SynthConfig
}

export interface MemoryProps extends BaseProps {
  values: number[]
  auto_reset: boolean
}
