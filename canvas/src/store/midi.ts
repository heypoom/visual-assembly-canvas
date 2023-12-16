import { map } from "nanostores"

import { MidiEvent } from "@/types/event"
import { MidiState } from "@/types/midi"

const defaultMidiState: MidiState = {
  ready: false,
  inputs: [],
  outputs: [],
}

export const $midi = map(defaultMidiState)
export const $lastMidiEvent = map<Record<number, MidiEvent | null>>({})
