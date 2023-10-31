export interface MachineState {
  error: MachineError | null
  stack: number[]
  logs: string[]
}

export type MachineError =
  | { CannotParse: { error: any } }
  | { ExecutionFailed: { id: number; error: any } }
  | { ExecutionCycleExceeded: { id: number } }
  | { HangingAwaits: { id: number } }

export type MachineStates = Record<number, MachineState>

export type MachineStatus =
  | "Invalid"
  | "Loaded"
  | "Ready"
  | "Running"
  | "Awaiting"
  | "Halted"
  | "Errored"
