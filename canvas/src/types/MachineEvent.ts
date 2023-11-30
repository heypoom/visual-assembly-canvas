import { MachineState, MachineStatus } from "./MachineState"

export type MachineEvent = { Print: { text: string } }

export interface InspectionState {
  stack: number[]
  events: MachineEvent[]
  registers: MachineState["registers"]

  inbox_size: number
  outbox_size: number
  status: MachineStatus
}
