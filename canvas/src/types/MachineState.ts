export interface MachineState {
  error: MachineError | null
  stack: number[]
  logs: string[]
}

export type ParseError = { CannotParse: { error: any } }
export type RuntimeError = { ExecutionFailed: { id: number; error: any } }

export type MachineError =
  | ParseError
  | RuntimeError
  | { ExecutionCycleExceeded: { id: number; status: MachineStatus } }

export type MachineStates = Record<number, MachineState>
export type MachineStatus = "Running" | "Awaiting" | "Halted"
