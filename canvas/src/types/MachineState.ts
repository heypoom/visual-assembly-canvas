export interface MachineState {
  error: MachineError | null
  stack: number[]
  logs: string[]
  registers: { pc: number; sp: number; fp: number }
}

export type MachineError =
  | { CannotParse: { error: unknown } }
  | { ExecutionFailed: { id: number; error: unknown } }
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
