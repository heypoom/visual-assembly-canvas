import { launchpad } from "../../../midi"
import { DeviceEvents, LaunchpadHandler } from "../../../midi/types/midi"
import { MidiInputEvent } from "../../../types/enums"

export const midiEventMap: Record<MidiInputEvent, DeviceEvents> = {
  NoteOn: "noteOn",
  NoteOff: "noteOff",
  ControlChange: "controlChange",
}

interface MidiListener {
  type: MidiInputEvent
  handle: LaunchpadHandler
}

export class MidiManager {
  /** Mapping of MIDI event listeners */
  midiListeners: Map<number, MidiListener> = new Map()

  async on(id: number, type: MidiInputEvent, handle: LaunchpadHandler) {
    if (this.midiListeners.has(id)) this.off(id)
    this.midiListeners.set(id, { type, handle })

    await launchpad.setup()

    launchpad.on(midiEventMap[type], handle)
  }

  off(id: number) {
    if (!this.midiListeners.has(id)) return

    const listener = this.midiListeners.get(id)
    if (!listener) return

    const { type, handle } = listener
    launchpad.off(midiEventMap[type], handle)

    this.midiListeners.delete(id)
  }
}

export const midiManager = new MidiManager()
