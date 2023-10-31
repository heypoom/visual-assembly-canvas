export interface MachineState {
  error: MachineError | null
  stack: number[]
  logs: string[]
  registers: { pc: number; sp: number; fp: number }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never

export type MachineError =
  | { CannotParse: { id: number; error: unknown } }
  | { ExecutionFailed: { id: number; error: unknown } }
  | { ExecutionCycleExceeded: { id: number } }
  | { MessageNeverReceived: { id: number } }

export type ErrorKeys = keyof UnionToIntersection<MachineError>

export type MachineStates = Record<number, MachineState>

export type MachineStatus =
  | "Invalid"
  | "Loaded"
  | "Ready"
  | "Running"
  | "Awaiting"
  | "Halted"
  | "Errored"
