export interface MachineState {
  error: Error | null
  stack: Uint16Array | null
  logs: string[] | null
}

export type MachineStates = Record<string, MachineState>
