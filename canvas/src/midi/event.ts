import { launchpad } from "."
import { $lastMidiEvent } from "../store/midi"
import { MidiEffect } from "../types/effects"

// TODO: add support for MIDI ports and channels
export function processMidiEvent(id: number, effect: MidiEffect) {
  if (!effect) return

  const midi = effect.Midi
  if (!midi) return

  $lastMidiEvent.setKey(id, effect)

  switch (midi.format) {
    case "Raw": {
      launchpad.dawOut?.send(midi.data)
      return
    }

    case "Note": {
      if (midi.data.length < 2) return

      const [note, rawAttack] = midi.data
      launchpad.midiOut?.playNote(note, { rawAttack })
      return
    }

    case "Launchpad": {
      launchpad.cmd(...midi.data)
      return
    }
  }
}
