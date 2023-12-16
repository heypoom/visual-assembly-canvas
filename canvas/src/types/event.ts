import { Event } from "machine-wasm"

export type EventTypes = Event["type"]
export type EventOf<T extends EventTypes> = Extract<Event, { type: T }>
export type MidiEvent = EventOf<"Midi">
