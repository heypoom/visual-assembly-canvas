import { map } from "nanostores"

import { MidiState } from "@/types/midi"
import { MidiEffect } from "@/types/effects"

const defaultMidiState: MidiState = {
  ready: false,
  inputs: [],
  outputs: [],
}

export const $midi = map(defaultMidiState)

export const $lastMidiEvent = map<Record<number, MidiEffect | null>>({})
