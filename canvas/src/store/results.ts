import { CanvasError, Effect } from "machine-wasm"
import { map } from "nanostores"

import { isBlock } from "@/blocks"
import { CanvasEngine, engine } from "@/engine"
import { processEffects } from "@/engine/effects"
import {
  $memoryPageConfig,
  $memoryPages,
  DEFAULT_PAGE_SIZE,
  pageToOffset,
} from "@/store/memory"
import { updateValueViewers } from "@/store/remote-values"
import { InspectionState, MachineEvent } from "@/types/MachineEvent"
import { MachineState, MachineStates } from "@/types/MachineState"

import { $nodes } from "./nodes"

export const $output = map<MachineStates>({})

const getLogs = (events: MachineEvent[]): string[] =>
  events.filter((e) => "Print" in e).map((e) => e.Print.text)

const toState = (result: InspectionState): MachineState => ({
  error: null,
  logs: getLogs(result.events) ?? [],
  registers: result.registers,

  inboxSize: result.inbox_size ?? 0,
  outboxSize: result.outbox_size ?? 0,
  status: result.status,
})

export const setError = (id: number, error: CanvasError) => {
  const output = $output.get()
  console.log(`[${id}] error =`, error)

  $output.setKey(id, { ...output[id], error })
}

export const syncMachineState = (manager: CanvasEngine) => {
  const output = $output.get()
  const nodes = $nodes.get()

  for (const node of nodes) {
    if (!isBlock.machine(node)) continue

    const { id } = node.data

    const events = manager.ctx?.consume_machine_side_effects(id)
    const inspected = manager.inspect(id)

    const curr = output[id]
    const next = toState({ ...inspected, events })

    processEffects(events as Effect[], id)

    // Preserve parse errors between steps, but discard cycle errors.
    const error =
      curr?.error && !isCycleError(curr.error) ? curr.error : next.error

    store.setKey(id, {
      ...next,
      error,

      // Preserve logs between steps.
      logs: [...(curr?.logs ?? []), ...next.logs],
    })

    updateMemoryViewer(id)
  }

  // After we've synchronized the machine states,
  // we update the value viewers as well.
  updateValueViewers()
}

export const updateMemoryViewer = (id: number) => {
  const { page, size = DEFAULT_PAGE_SIZE } = $memoryPageConfig.get()[id] ?? {}
  const memOffset = pageToOffset(page, size)

  const mem = engine.ctx?.read_mem(id, memOffset, size) as number[]
  if (mem) $memoryPages.setKey(id, mem)
}

export const clearPreviousRun = (manager: CanvasEngine) => {
  const curr = $output.get()

  manager.statuses.forEach((status, id) => {
    // Do not clear if the machine is still invalid.
    if (status === "Invalid" || status === "Errored") return

    const state = curr[id]
    const { error } = state ?? {}

    $output.setKey(id, {
      ...state,
      logs: [],
      error: isCycleError(error) ? error : null,
    })
  })
}

const isCycleError = (error: CanvasError | null) => {
  if (!error) return false

  const { type } = error
  if (type !== "MachineError") return false

  const { cause } = error

  return (
    cause.type === "ExecutionCycleExceeded" ||
    cause.type === "MessageNeverReceived"
  )
}
