import { ReactFlowJsonObject } from "reactflow"

import { BlockValues } from "../types/Node"
import { ClockConfig } from "../store/clock"

export interface SaveState {
  flow: ReactFlowJsonObject<BlockValues>
  clock: ClockConfig

  /** ID counters. */
  counters: [block: number, wire: number]
}

export interface PersistenceDriver {
  save: (serialize: () => SaveState, name?: string) => void
  load: (restore: (state: SaveState) => void, name?: string) => void
  delete: (name?: string) => void
  list: () => string[]
}

export interface PersistConfig {
  driver?: PersistenceDriver
}
