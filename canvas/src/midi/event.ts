import { launchpad, midiManager } from "."
import { $lastMidiEvent } from "../store/midi"
import { MidiEffect } from "../types/effects"

export async function processMidiEvent(id: number, effect: MidiEffect) {
  try {
    if (!effect) return

    const midi = effect.Midi
    if (!midi) return
    if (!midiManager.initialized) await midiManager.setup()

    $lastMidiEvent.setKey(id, effect)

    const { format, data, port, channel } = midi
    const output = midiManager.outputs[port]
    if (!output) return

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
        if (!launchpad.initialized) launchpad.setup(midiManager)

        launchpad.cmd(...data)
        return
      }
    }
  } catch (error) {
    console.warn("midi error:", error)
  }
}
