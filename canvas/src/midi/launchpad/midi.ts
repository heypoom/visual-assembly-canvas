import { WebMidi } from "webmidi"

/**
 * Enables the MIDI interface with SysEx command support.
 */
export const enableMidiWithSysEx = () => WebMidi.enable({ sysex: true })

export function inputOf(name: string) {
  const inPort = WebMidi.getInputByName(name)
  if (inPort) return inPort
}

export function outputOf(name: string) {
  const outPort = WebMidi.getOutputByName(name)
  if (outPort) return outPort
}
