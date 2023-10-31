import { map, action } from "nanostores"

import {
  MachineError,
  MachineState,
  MachineStates,
} from "../types/MachineState"
import { $nodes } from "./nodes"
import { MachineManager } from "../machine"
import { MachineEvent, InspectionState } from "../types/MachineEvent"

export const $output = map<MachineStates>({})

const getLogs = (events: MachineEvent[]): string[] =>
  events.filter((e) => "Print" in e).map((e) => e.Print.text)

const toState = (result: InspectionState): MachineState => ({
  error: null,
  stack: result.stack ?? [],
  logs: getLogs(result.events) ?? [],
  registers: result.registers,
})

export const setError = action(
  $output,
  "set error",
  (store, id: number, error: MachineError) => {
    const output = store.get()

    store.setKey(id, { ...output[id], error })
  },
)

export const setMachineState = action(
  $output,
  "set machine state",
  (store, manager: MachineManager) => {
    const output = store.get()

    $nodes.get().forEach((node) => {
      const { id } = node.data
      const events = manager.ctx?.consume_side_effects(id)

      const curr = output[id]
      const next = toState({ ...manager.inspect(id), events })

      store.setKey(id, {
        ...next,

        // Preserve logs between steps.
        logs: [...(curr?.logs ?? []), ...next.logs],

        // Preserve parse errors between steps.
        error: curr?.error ? curr.error : next.error,
      })
    })
  },
)

export const clearPreviousRun = action(
  $output,
  "clear previous run",
  (store, manager: MachineManager) => {
    const curr = store.get()

    manager.statuses.forEach((status, id) => {
      // Do not clear if the machine is still invalid.
      if (status === "Invalid" || status === "Errored") return

      const state = curr[id]
      const { error } = state ?? {}

      store.setKey(id, {
        ...state,
        logs: [],
        error: isCycleError(error) ? error : null,
      })
    })
  },
)

const isCycleError = (error: MachineError | null) => {
  if (!error) return false

  return "ExecutionCycleExceeded" in error || "HangingAwaits" in error
}
