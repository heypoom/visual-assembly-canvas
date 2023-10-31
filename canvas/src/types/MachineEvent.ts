import { MachineState } from "./MachineState"

export type MachineEvent = { Print: { text: string } }

export interface InspectionState {
  stack: number[]
  events: MachineEvent[]
  messages: unknown[]
  registers: MachineState["registers"]
}
