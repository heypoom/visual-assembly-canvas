import { map } from "nanostores"

import { MidiEffect } from "@/types/effects"
import { MidiState } from "@/types/midi"

const defaultMidiState: MidiState = {
  ready: false,
  inputs: [],
  outputs: [],
}

export const $midi = map(defaultMidiState)

export const $lastMidiEvent = map<Record<number, MidiEffect | null>>({})
