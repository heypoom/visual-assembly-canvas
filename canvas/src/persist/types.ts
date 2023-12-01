import { ReactFlowJsonObject } from "reactflow"
import { BlockValues } from "../types/Node"
import { ClockConfig } from "../store/clock"

export interface SaveState {
  flow: ReactFlowJsonObject<BlockValues>
  engine: unknown
  clock: ClockConfig
}

export interface PersistenceDriver {
  save: (serialize: () => SaveState) => void
  load: (restore: (state: SaveState) => void) => void
}

export interface PersistConfig {
  driver?: PersistenceDriver
}
