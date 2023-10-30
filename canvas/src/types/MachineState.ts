export interface MachineState {
  error: MachineError | null
  stack: number[]
  logs: string[]
}

export type MachineError = { CannotParse: { error: any } }

export type MachineStates = Record<number, MachineState>
