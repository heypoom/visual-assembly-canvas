import setup, { Controller } from "machine-wasm"

import { $nodes } from "../store/nodes"

import {
  setError,
  setMachineState,
  clearPreviousRun,
  $output,
} from "../store/results"

import { getSourceHighlightMap } from "./utils/getHighlightedSourceLine"

import {
  MachineStatus,
  CanvasError,
  canvasErrors,
  MachineError,
} from "../types/MachineState"

import { InspectionState } from "../types/MachineEvent"
import { $status } from "../store/status"

import { $delay } from "../store/canvas"
import { isBlock } from "../canvas/blocks"
import { updateNode } from "../store/blocks"
import { midiManager } from "../canvas/blocks/midi/manager"

export const setSource = (id: number, source: string) => {
  updateNode(id, (node) => {
    if (isBlock.machine(node)) node.data.source = source
  })
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const machineError = (cause: MachineError): CanvasError => ({
  MachineError: { cause },
})

export type HighlighterFn = (lineNo: number) => void

type HaltReason = "paused" | "cycle" | "duration" | "halted"

export class CanvasManager {
  ctx: Controller | null = null

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
      console.log("syntax error ->", error)

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

  get isHalted(): boolean {
    if (this.runUntilPause) return false

    return this.ctx?.is_halted() ?? false
  }

  get delayMs(): number {
    return $delay.get()
  }

  /**
   * Indicate that we should run until pause, without any cycle limit or halting checks.
   */
  get runUntilPause(): boolean {
    return this.delayMs > 0 && (this.hasProducers || this.hasInteractors)
  }

  get nodes() {
    return $nodes.get()
  }

  /**
   * Does the canvas has any signal producers, e.g. oscillators?
   * This is used to determine if we should run until pause.
   */
  get hasProducers() {
    return this.nodes.some(isBlock.osc)
  }

  /** Does the canvas has any machines? */
  get hasMachines() {
    return this.nodes.some(isBlock.machine)
  }

  /** Does the canvas has any real-time interactors, e.g. tap blocks? */
  get hasInteractors() {
    return this.nodes.some(isBlock.tap)
  }

  /** Continue the execution. */
  run = async () => {
    const startMs = performance.now()
    $status.setKey("running", true)

    // Check the canvas for presence of blocks that alter run behaviour.
    const hasMachines = this.hasMachines
    const watchdog = !this.hasInteractors || this.delayMs === 0

    // Disable the watchdog if we have interactors, e.g. tap blocks.
    // Watchdog must be enabled if we are in real-time mode, otherwise the browser could hang.
    this.ctx?.set_await_watchdog(watchdog)

    // Should we enable halting detection?
    const runUntilPause = this.runUntilPause
    const detectHang = !runUntilPause
    let cycle = 0

    while (runUntilPause || cycle < this.maxCycle) {
      // Execution is forced to pause by the user.
      if (this.pause) {
        this.pause = false
        this.haltReason = "paused"
        break
      }

      this.step({ batch: true })

      // Add an artificial delay to allow the user to see the changes
      if (this.delayMs > 0) await delay(this.delayMs)

      // Halt detection - machine gracefully completes a run.
      if (hasMachines && this.isHalted) {
        this.haltReason = "halted"
        break
      }

      // Hang detection. Detect infinite loops and deadlocks.
      if (detectHang) {
        cycle++

        // We take the artificial delay into account.
        const duration = performance.now() - startMs
        const limit = this.maxRuntime * (this.delayMs || 1)

        // Did we exceed the execution time limit?
        if (duration > limit) {
          this.haltReason = "duration"
          break
        }
      }
    }

    // extra step to let the blocks tick
    this.step({ batch: true })

    if (cycle >= this.maxCycle) this.haltReason = "cycle"

    $status.setKey("running", false)
    this.ctx?.set_await_watchdog(true)

    if (detectHang) this.reportHang()
  }

  /** Check if our program ever halts. Helps prevent hangs, infinite loops, and awaiting for messages. */
  reportHang() {
    setTimeout(() => {
      if (!this.isHalted) {
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
      this.ctx?.step()
    } catch (error) {
      this.detectCanvasError(error)
    }

    // Synchronize the machine state with the store.
    setMachineState(this)

    // Highlight the current line.
    if (this.delayMs > 0) this.highlightCurrent()

    // Tick the blocks.
    this.updateBlocks()

    // TODO: add an indicator to the block for a halted machine.
    // TODO: we should remove this behaviour to prevent confusion!
    // If running in steps, we should reset the machine once it halts.
    const halted = this.isHalted
    if (!config.batch && halted) this.reloadMachines()
    if (halted) $status.setKey("halted", true)
  }

  updateBlocks() {
    // TODO: optimize data transfer. only get the "data" field, not the full block.
    const blocks = this.ctx?.get_blocks()

    for (const block of blocks) {
      updateNode(block.id, (node) => {
        const type = node.type
        if (type) node.data = { ...node.data, ...block.data[type] }
      })
    }
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

  highlightCurrent() {
    const output = $output.get()

    this.highlighters.forEach((highlight, id) => {
      const mapping = this.highlightMaps.get(id)
      const state = output[id]
      const pc = state?.registers?.pc ?? 0
      const lineNo = (mapping?.get(pc) ?? 0) + 1

      highlight(lineNo)
    })
  }

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
    setMachineState(this)
  }

  removeBlock(id: number) {
    // Get the block before it is removed.
    const block = this.nodes.find((n) => n.data.id === id)

    // Teardown the blocks.
    if (block) {
      // Remove the midi listeners.
      if (isBlock.midiIn(block) || isBlock.midiOut(block)) midiManager.off(id)
    }

    // Remove the block.
    this.ctx?.remove_block(id)

    // Teardown the code editor state.
    this.sources.delete(id)
    this.highlightMaps.delete(id)
  }
}

export const manager = new CanvasManager()
await manager.setup()

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.manager = manager
