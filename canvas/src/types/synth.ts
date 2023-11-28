import { UnionToIntersection } from "./helper"

export type SynthConfig =
  | { Basic: null }
  | { FM: null }
  | { AM: null }
  | { Noise: null }
  | { Poly: { synth: SynthConfig } }

export type SynthType = keyof UnionToIntersection<SynthConfig>
