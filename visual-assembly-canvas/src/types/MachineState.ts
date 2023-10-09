export interface MachineState {
  error: Error | null
  stack: number[]
  logs: string[]
}

export type MachineStates = Record<number, MachineState>
