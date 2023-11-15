import { map, action } from "nanostores"

import { CanvasError, MachineState, MachineStates } from "../types/MachineState"

import { $nodes } from "./nodes"
import { CanvasManager } from "../core"
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
  (store, id: number, error: CanvasError) => {
    const output = store.get()
    console.log(`[${id}] error =`, error)

    store.setKey(id, { ...output[id], error })
  },
)

export const syncMachineState = action(
  $output,
  "sync machine state",
  (store, manager: CanvasManager) => {
    const output = store.get()

    $nodes.get().forEach((node) => {
      const { id } = node.data
      const events = manager.ctx?.consume_machine_side_effects(id)

      const curr = output[id]
      const next = toState({ ...manager.inspect(id), events })

      // Preserve parse errors between steps, but discard cycle errors.
      const error =
        curr?.error && !isCycleError(curr.error) ? curr.error : next.error

      store.setKey(id, {
        ...next,
        error,

        // Preserve logs between steps.
        logs: [...(curr?.logs ?? []), ...next.logs],
      })
    })
  },
)

export const clearPreviousRun = action(
  $output,
  "clear previous run",
  (store, manager: CanvasManager) => {
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

const isCycleError = (error: CanvasError | null) => {
  if (!error) return false
  if (!("MachineError" in error)) return false

  const { cause } = error.MachineError

  return "ExecutionCycleExceeded" in cause || "HangingAwaits" in cause
}
