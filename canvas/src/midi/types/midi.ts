// Events that we could listen for the launchpad.
export type DeviceEvents =
  | "controlChange"
  | "noteOn"
  | "noteOff"
  | "dawNoteOn"
  | "dawNoteOff"
  | "update"
  | "clear"
  | "ready"

// Event handler for the launchpad events.
export type LaunchpadHandler = (note: number, velocity: number) => void

// Map of events to the event handlers.
export type DeviceListeners = Record<DeviceEvents, LaunchpadHandler[]>

// Grid to map between note value to button position, and vice-versa.
export type MapperGrid = { [index: number]: number }
