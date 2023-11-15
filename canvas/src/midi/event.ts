import { launchpad } from "."
import { $lastMidiEvent } from "../store/midi"
import { MidiEffect } from "../types/effects"

// TODO: add support for MIDI ports and channels
export function processMidiEvent(id: number, effect: MidiEffect) {
  if (!effect) return

  const midi = effect.Midi
  if (!midi) return

  $lastMidiEvent.setKey(id, effect)

  const { format, data, port, channel } = midi

  const outputs = [launchpad.midiOut, launchpad.dawOut]
  const output = outputs[port]

  switch (format) {
    case "Raw": {
      output?.send(data)
      return
    }

    case "Note": {
      if (data.length < 2) return

      const [note, rawAttack] = data
      output?.playNote(note, { rawAttack, channels: channel })

      return
    }

    case "ControlChange": {
      if (data.length < 2) return

      const [controller, value] = data
      output?.sendControlChange(controller, value, { channels: channel })

      return
    }

    case "Launchpad": {
      launchpad.cmd(...data)
      return
    }
  }
}
