import { Input, Output, WebMidi } from "webmidi"

import { ControlCodes } from "./controls"

import {
  Flash,
  Pulse,
  RGB,
  buildSpecFromGrid,
  buildFillGrid,
  getTrait,
} from "./specs"

import { Spec, InputGrid } from "./types/specs"

/** Utility for interacting with Launchpad X */
export class Launchpad {
  // Interface for the 64-button pressure-sensitive areas
  midiIn?: Input
  midiOut?: Output

  // Interface for the 16 control buttons.
  dawIn?: Input
  dawOut?: Output

  // MIDI interface name for the MIDI device
  midiInName = "Launchpad X LPX MIDI Out"
  midiOutName = "Launchpad X LPX MIDI In"

  // MIDI interface name for the DAW device
  dawInName = "Launchpad X LPX DAW Out"
  dawOutName = "Launchpad X LPX DAW In"

  // Has the launchpad module been initialized?
  initialized = false

  /** Reset the control lights. */
  resetControlLights() {
    Object.values(ControlCodes).forEach((code) => this.light(code, 0))
  }

  /** Setup the launchpad device. */
  async setup() {
    if (this.initialized) return

    this.initPorts()
    this.useProgrammerLayout()
    this.resetControlLights()

    this.initialized = true

    console.info("Launchpad setup completed.")
  }

  /** Initializes the MIDI ports for the launchpad. */
  initPorts() {
    this.midiIn = WebMidi.getInputByName(this.midiInName)
    this.midiOut = WebMidi.getOutputByName(this.midiOutName)
    this.dawIn = WebMidi.getInputByName(this.dawInName)
    this.dawOut = WebMidi.getOutputByName(this.dawOutName)
  }

  useProgrammerLayout() {
    this.cmd(0, 127)
    this.cmd(14, 1)
  }

  /**
   * Sends a data payload via the SysEx interface.
   * @param data the data payload array (value should be between 0-255)
   */
  cmd(...data: number[]) {
    if (!this.dawOut) return

    try {
      this.dawOut.send([240, 0, 32, 41, 2, 12, ...data, 247])
    } catch (error) {
      console.warn("launchpad error:", error)
    }
  }

  /**
   * Alternates between 2 colors.
   *
   * @param n note value
   * @param a first color
   * @param b second color
   */
  flash(n: number, a: number, b: number) {
    this.display(n, Flash(a, b))
  }

  /**
   * Displays the RGB colors. Each note value should be between 0 - 127.
   *
   * @param n note value
   * @param r red value (0 - 127)
   * @param g green value (0 - 127)
   * @param b blue (0 - 127)
   */
  rgb(n: number, r: number, g: number, b: number) {
    this.display(n, RGB(r, g, b))
  }

  /**
   * Pulse the colors rapidly.
   *
   * @param n
   * @param color
   */
  pulse(n: number, color: number) {
    this.display(n, Pulse(color))
  }

  /**
   * Transforms the specs into data payload, and sends it.
   *
   * @param specs
   */
  batch(specs: Spec[]) {
    this.cmd(3, ...specs.flat())
  }

  /**
   * Display the display trait
   *
   * @param note
   * @param trait
   */
  display(note: number, trait: Spec) {
    this.batch([getTrait(note, trait)])
  }

  /**
   * Lights up the pad with the specified solid color.
   *
   * @param note the note position on the launchpad
   * @param color the color number between 0 - 127
   */
  light(note: number, color: number) {
    if (!this.midiOut) return

    this.midiOut.playNote(note, {
      rawAttack: color,
      channels: 1,
    })
  }

  grid(grid: InputGrid) {
    this.batch(buildSpecFromGrid(grid))
  }

  /**
   * Fills every pad with the specified color.
   */
  fill(color: number | Spec = 0) {
    this.grid(buildFillGrid(color))
  }
}

export const launchpad = new Launchpad()

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
/** @ts-ignore */
window.launchpad = launchpad
