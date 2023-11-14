import { map } from "nanostores"
import { MidiEffect } from "../types/effects"

export const $midi = map({
  ready: false,
})

export const $lastMidiEvent = map<Record<number, MidiEffect | null>>({})
