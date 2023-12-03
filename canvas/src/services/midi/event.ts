import { chunk } from "lodash"

import { $lastMidiEvent } from "@/store/midi"
import { MidiEffect } from "@/types/effects"

import { launchpad, midiManager } from "./index"

export async function processMidiEvent(id: number, effect: MidiEffect) {
  try {
    if (!effect) return

    const midi = effect.Midi
    if (!midi) return

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

        // chunk of 2
        chunk(data, 2).forEach(([note, rawAttack]) => {
          output?.playNote(note % 128, {
            rawAttack: rawAttack % 128,
            channels: channel,
          })
        })

        return
      }

      case "ControlChange": {
        if (data.length < 2) return

        chunk(data, 2).forEach(([controller, value]) => {
          output?.sendControlChange(controller % 128, value % 128, {
            channels: channel,
          })
        })

        return
      }

      case "Launchpad": {
        launchpad.cmd(...data)
        return
      }
    }
  } catch (error) {
    console.warn("midi error:", error)
  }
}
