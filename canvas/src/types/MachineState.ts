export interface MachineState {
  error: MachineError | null
  stack: number[]
  logs: string[]
  registers: { pc: number; sp: number; fp: number }
}

export type MachineStates = Record<number, MachineState>

export type MachineStatus =
  | "Invalid"
  | "Loaded"
  | "Ready"
  | "Running"
  | "Awaiting"
  | "Halted"
  | "Errored"

type CannotParse = { CannotParse: { id: number; error: unknown } }
type ExecutionFailed = { ExecutionFailed: { id: number; error: unknown } }
type ExecutionCycleExceeded = { ExecutionCycleExceeded: { id: number } }
type MessageNeverReceived = { MessageNeverReceived: { id: number } }

// Type exported by wasm-bindgen. Wish it would've been a discriminated union instead!
export type MachineError =
  | CannotParse
  | ExecutionFailed
  | ExecutionCycleExceeded
  | MessageNeverReceived

type ExtractKeys<T> = T extends { [K in keyof T]: infer U } ? keyof T : never
type ErrorKeys = ExtractKeys<MachineError>

const isErrorType = <E extends MachineError, K extends ErrorKeys>(
  error: E | null,
  type: K,
): boolean => {
  if (!error) return false

  return type in error
}

export const errors = {
  cannotParse: (e): e is CannotParse => isErrorType(e, "CannotParse"),

  executionFailed: (e): e is ExecutionFailed =>
    isErrorType(e, "ExecutionFailed"),

  executionCycleExceeded: (e): e is ExecutionCycleExceeded =>
    isErrorType(e, "ExecutionCycleExceeded"),

  messageNeverReceived: (e): e is MessageNeverReceived =>
    isErrorType(e, "MessageNeverReceived"),
} satisfies Record<string, (error: MachineError) => boolean>
