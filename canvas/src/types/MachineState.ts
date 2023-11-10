import { Port } from "machine-wasm"

export interface MachineState {
  error: CanvasError | null
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
type DisconnectedPort = { DisconnectedPort: { port: Port } }

export type CanvasError = CanvasMachineError | DisconnectedPort

type CanvasMachineError = { MachineError: { cause: MachineError } }

// Type exported by wasm-bindgen. Wish it would've been a discriminated union instead!
export type MachineError =
  | CannotParse
  | ExecutionFailed
  | ExecutionCycleExceeded
  | MessageNeverReceived

export type ExtractKeys<T> = T extends { [K in keyof T]: unknown }
  ? keyof T
  : never

export type CanvasErrorKeys = ExtractKeys<CanvasError>

export const isCanvasErrorType = <
  E extends CanvasError,
  K extends CanvasErrorKeys,
>(
  error: E | null,
  type: K,
): boolean => {
  if (!error) return false

  return type in error
}

export type MachineErrorKeys = ExtractKeys<MachineError>

const isMachineErrorType = <E extends MachineError, K extends MachineErrorKeys>(
  error: E | null,
  type: K,
): boolean => {
  if (!error) return false

  return type in error
}

export const canvasErrors = {
  machineError: (e): e is CanvasMachineError =>
    isCanvasErrorType(e, "MachineError"),

  disconnectedPort: (e): e is DisconnectedPort =>
    isCanvasErrorType(e, "DisconnectedPort"),
} satisfies Record<string, (error: CanvasError) => boolean>

export const runErrors = {
  cannotParse: (e): e is CannotParse => isMachineErrorType(e, "CannotParse"),

  executionFailed: (e): e is ExecutionFailed =>
    isMachineErrorType(e, "ExecutionFailed"),

  executionCycleExceeded: (e): e is ExecutionCycleExceeded =>
    isMachineErrorType(e, "ExecutionCycleExceeded"),

  messageNeverReceived: (e): e is MessageNeverReceived =>
    isMachineErrorType(e, "MessageNeverReceived"),
} satisfies Record<string, (error: MachineError) => boolean>
