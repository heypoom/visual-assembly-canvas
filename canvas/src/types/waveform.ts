import { UnionToIntersection } from "./helper"

export type Waveform =
  | { Sine: null }
  | { Cosine: null }
  | { Tangent: null }
  | { Square: { duty_cycle: number } }
  | { Sawtooth: null }
  | { Triangle: null }
  | { Noise: null }

export type WaveformKey = keyof UnionToIntersection<Waveform>
