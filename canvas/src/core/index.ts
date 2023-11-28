import setup, { Controller } from "machine-wasm"

import { $nodes } from "../store/nodes"

import {
  setError,
  syncMachineState as _syncMachineState,
  clearPreviousRun,
  $output,
} from "../store/results"

import { getSourceHighlightMap } from "./highlight/getHighlightedSourceLine"

import { throttle } from "lodash"

import {
  MachineStatus,
  CanvasError,
  canvasErrors,
  MachineError,
} from "../types/MachineState"

import { InspectionState } from "../types/MachineEvent"
import { $status } from "../store/status"

import { $delay } from "../store/canvas"
import { isBlock as is } from "../canvas/blocks"
import { syncBlockData } from "../store/blocks"
import { midiManager } from "../services/midi/manager"
import { processMidiEvent } from "../services/midi/event"
import { Effect } from "../types/effects"
import { timed } from "../utils/timed"
import { Action } from "../types/actions"
import { processSynthEffect } from "../services/audio/process-synth"
import { audioManager } from "../services/audio/manager"

/** When running in real-time mode with 1ms delay, we need to throttle to avoid side effect lag. */
const throttles = {
  highlight: 10,
  updateBlocks: 1,
  syncMachineState: 4,
}

const syncMachineState = throttle(
  _syncMachineState,
  throttles.syncMachineState,
  { trailing: true },
)

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const machineError = (cause: MachineError): CanvasError => ({
  MachineError: { cause },
})

export type HighlighterFn = (lineNo: number) => void

type HaltReason = "paused" | "cycle" | "duration" | "halted"

export class CanvasManager {
  ctx: Controller | null = null

  cycle = 0

  /** What is the limit on number of cycles? This prevents crashes. */
  maxCycle = 200

  /** What is the limit on execution time, excluding the delay? This prevents crashes. */
  maxRuntime = 2000

  /** Is every machine ready to run? */
  ready = false

  /** Should machine prepare to pause execution? */
  pause = false

  /** Why did the machine last halt? */
  haltReason: HaltReason | null = null

  sources: Map<number, string> = new Map()

  highlighters: Map<number, HighlighterFn> = new Map()

  /** Map<blockId, Map<programCounter, sourceLine>>  */
  highlightMaps: Map<number, Map<number, number>> = new Map()

  startMs = 0
  hasMachines = false
  hasProducers = false
  shouldRunUntilPause = false

  async setup() {
    await setup()
    this.ctx = Controller.create()
  }

  load(id: number, source: string, force?: boolean) {
    // If the source is the same, we don't need to reload.
    if (this.sources.get(id) === source && !force) return this.invalidate()
    this.sources.set(id, source)

    try {
      this.ctx?.load(id, source)
      this.setSyntaxError(id, null)
      this.highlightMaps.set(id, getSourceHighlightMap(source))
      this.invalidate()
    } catch (error) {
      this.setSyntaxError(id, error)
    }
  }

  setSyntaxError(id: number, error: unknown | null) {
    if (error) setError(id, error as CanvasError)
  }

  inspect(id: number): InspectionState {
    return this.ctx?.inspect(id)
  }

  prepare = () => {
    if (this.ready) return

    this.ctx?.ready()
    this.ready = true

    clearPreviousRun(this)
  }

  isHalted(): boolean {
    if (this.shouldRunUntilPause) return false

    return this.ctx?.is_halted() ?? false
  }

  get delayMs(): number {
    return $delay.get()
  }

  get nodes() {
    return $nodes.get()
  }

  async prepareRun() {
    $status.setKey("running", true)

    // Wait for the audio context to be ready.
    await audioManager.ready()

    this.startMs = performance.now()
    this.hasMachines = this.nodes.some(is.machine)

    this.hasProducers = this.nodes.some(
      (n) => is.clock(n) || is.midiIn(n) || is.tap(n),
    )

    this.shouldRunUntilPause = this.delayMs > 0 && this.hasProducers

    // Disable the watchdog if we have interactors, e.g., tap blocks.
    // Watchdog must be enabled if we are in real-time mode, otherwise the browser could hang.
    this.ctx?.set_await_watchdog(!this.shouldRunUntilPause)
  }

  cleanupRun() {
    // extra step to let the block tick
    this.step({ batch: true })

    if (this.cycle >= this.maxCycle) this.haltReason = "cycle"

    $status.setKey("running", false)
    this.ctx?.set_await_watchdog(true)

    if (!this.shouldRunUntilPause) this.reportHang()
  }

  /** Continue the execution. */
  run = async () => {
    await this.prepareRun()

    while (this.shouldRunUntilPause || this.cycle < this.maxCycle) {
      const ok = await this.stepWithChecks()
      if (!ok) break
    }

    this.cleanupRun()
  }

  async stepWithChecks() {
    // Execution is forced to pause by the user.
    if (this.haltIf(this.pause, "paused")) {
      this.pause = false
      return
    }

    timed("run::step", () => this.step({ batch: true }), 1.1)

    // Add an artificial delay to allow the user to see the changes
    // TODO: replace this with a proper scheduler
    if (this.delayMs > 0) await delay(this.delayMs)

    // Halt detection - machine gracefully completes a run.
    if (this.haltIf(this.hasMachines && this.isHalted(), "halted")) return

    // Hang detection. Detect infinite loops and deadlocks.
    if (!this.shouldRunUntilPause) this.cycle++

    return true
  }

  haltIf(condition: boolean, reason: HaltReason) {
    if (condition) this.haltReason = reason
    return condition
  }

  /** Check if our program ever halts. Helps prevent hangs, infinite loops, and awaiting for messages. */
  reportHang() {
    setTimeout(() => {
      if (!this.isHalted()) {
        this.statuses.forEach((status, id) => {
          const error = this.getHaltError(id, status)
          if (error) setError(id, machineError(error))
        })
      }
    }, 10)
  }

  invalidate() {
    this.ready = false
  }

  /** Returns an error that explains why the machine halted. */
  getHaltError(id: number, status: MachineStatus): MachineError | undefined {
    if (status === "Awaiting") {
      return { MessageNeverReceived: { id } }
    }

    if (status === "Running") {
      switch (this.haltReason) {
        case "cycle":
          return { ExecutionCycleExceeded: { id } }
        case "duration":
          return { ExecutionTimeExceeded: { id } }
      }
    }
  }

  get statuses(): Map<number, MachineStatus> {
    return this.ctx?.statuses()
  }

  step = (config: { batch?: boolean } = {}) => {
    $status.setKey("halted", false)

    // If the program is not initialized yet, we need to initialize it.
    this.prepare()

    try {
      timed("wasm::step", () => this.ctx?.step())
    } catch (error) {
      this.detectCanvasError(error)
    }

    // Perform side effects first so it feels fast.
    timed("side effects", this.performSideEffects.bind(this))

    // Synchronize the machine state with the store.
    timed("sync machine state", () => syncMachineState(this))

    // Highlight the current line.
    if (this.delayMs > 0) this.highlight()

    // Tick the blocks.
    this.updateBlocks()

    // TODO: add an indicator to the block for a halted machine.
    // TODO: we should remove this behaviour to prevent confusion!
    // If running in steps, we should reset the machine once it halts.
    const halted = this.isHalted()
    if (!config.batch && halted) this.reloadMachines()
    if (halted) $status.setKey("halted", true)
  }

  consumeSideEffects(): Map<number, Effect[]> {
    return this.ctx?.consume_block_side_effects()
  }

  performSideEffects() {
    this.consumeSideEffects().forEach((effects, id) => {
      for (const effect of effects) {
        if ("Midi" in effect) return processMidiEvent(id, effect).then()
        if ("Synth" in effect) return processSynthEffect(id, effect)

        console.info("unknown effect:", effect)
      }
    })
  }

  _updateBlocks() {
    const blocks = timed("wasm::get_blocks", () => this.ctx?.get_blocks())
    timed("syncBlockData", () => blocks.forEach(syncBlockData))
  }

  updateBlocks = throttle(
    this._updateBlocks.bind(this),
    throttles.updateBlocks,
    { trailing: true },
  )

  updateBlock(id: number) {
    syncBlockData(this.ctx?.get_block(id))
  }

  detectCanvasError(error: unknown) {
    const e = error as CanvasError

    if (canvasErrors.disconnectedPort(e)) {
      const id = e.DisconnectedPort.port?.block
      setError(id, e)
      return
    }

    if (canvasErrors.machineError(e)) {
      const { cause } = e.MachineError

      const inner = Object.values(cause)[0]
      if (inner?.id) setError(inner.id, e)

      return
    }

    console.error("Unhandled canvas error:", error)
  }

  _highlight() {
    const output = $output.get()

    this.highlighters.forEach((highlight, id) => {
      const mapping = this.highlightMaps.get(id)
      const state = output[id]
      const pc = state?.registers?.pc ?? 0
      const lineNo = (mapping?.get(pc) ?? 0) + 1

      timed(`highlight(${id}, ${lineNo})`, () => highlight(lineNo), 0.25)
    })
  }

  highlight = throttle(this._highlight.bind(this), throttles.highlight, {
    trailing: true,
  })

  reloadMachines() {
    this.sources.forEach((source, id) => {
      this.load(id, source, true)
    })
  }

  reset() {
    const { running } = $status.get()
    if (running) this.pause = true

    // Invalidate the ready flag.
    this.invalidate()

    // Reset blocks and update UI
    this.ctx?.reset_blocks()
    this.updateBlocks()

    // Reset machines and update UI
    this.reloadMachines()
    syncMachineState(this)
  }

  removeBlock(id: number) {
    // Get the block before it is removed.
    const block = this.nodes.find((n) => n.data.id === id)

    // Teardown the blocks.
    if (block) {
      // Remove the midi listeners.
      if (is.midiIn(block) || is.midiOut(block)) midiManager.off(id)
    }

    // Remove the block.
    this.ctx?.remove_block(id)

    // Teardown the code editor state.
    this.sources.delete(id)
    this.highlightMaps.delete(id)
  }

  resetBlock(id: number) {
    this.ctx?.reset_block(id)
    this.updateBlock(id)
  }

  send(id: number, action: Action) {
    this.ctx?.send_message_to_block(id, action)
  }
}

export const manager = new CanvasManager()
await manager.setup()

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.manager = manager
