import { UnionToIntersection } from "./helper"

export type SynthConfig =
  | { Basic: null }
  | { FM: null }
  | { AM: null }
  | { Noise: null }

export type SynthType = keyof UnionToIntersection<SynthConfig>

export type SynthTrigger =
  | { Attack: { freq: number; time: number } }
  | { Release: { time: number } }
  | { AttackRelease: AttackReleaseConfig }

export interface AttackReleaseConfig {
  freq: number
  duration: number
  time: number
}
