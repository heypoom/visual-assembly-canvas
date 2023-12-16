export interface MachineState {
  error: CanvasError | null
  logs: string[]
  registers: { pc: number; sp: number; fp: number }

  inboxSize: number
  outboxSize: number
  status: MachineStatus
}

export type MachineStates = Record<number, MachineState>

export type ExtractKeys<T> = T extends { [K in keyof T]: unknown }
  ? keyof T
  : never

export type CanvasErrorKeys = ExtractKeys<CanvasError>

