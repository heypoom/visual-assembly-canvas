import { ReactFlowJsonObject } from "reactflow"
import { BlockValues } from "../types/Node"

export interface SaveState {
  flow: ReactFlowJsonObject<BlockValues>
  engine: unknown
}

export interface PersistenceDriver {
  save: (serialize: () => SaveState) => void
  load: (restore: (state: SaveState) => void) => void
}

export interface PersistConfig {
  driver?: PersistenceDriver
}
