import setup, { Controller } from "machine-wasm"

import { isBlock as is, isBlock } from "@/blocks"
import { midiManager } from "@/services/midi"
import { syncBlockData } from "@/store/blocks"
import { $clock } from "@/store/clock"
import { $nodes } from "@/store/nodes"
import {
  $output,
  clearPreviousRun,
  setError,
  syncMachineState,
} from "@/store/results"
import { $status } from "@/store/status"
import { Action } from "@/types/actions"
import { Effect } from "@/types/effects"
import { InspectionState } from "@/types/MachineEvent"
import {
  CanvasError,
  canvasErrors,
  MachineError,
  MachineStatus,
} from "@/types/MachineState"

import { processEffects } from "./effects"
import { getSourceHighlightMap } from "./highlight/getHighlightedSourceLine"

const machineError = (cause: MachineError): CanvasError => ({
  MachineError: { cause },
})

export type HighlighterFn = (lineNo: number) => void

/** Map<blockId, Map<programCounter, sourceLine>>  */
type HighlightMaps = Map<number, Map<number, number>>

type HaltReason = "cycle" | "halted"

export class CanvasEngine {
  public ctx: Controller | null = null

  /** What is the limit on number of cycles? This prevents crashes. */
  public maxCycle = 500000

  private cycle = 0

  /** Is every machine ready to run? */
  private ready = false

  /** Why did the machine last halt? */
  public haltReason: HaltReason | null = null

  private sources: Map<number, string> = new Map()
  private highlightMaps: HighlightMaps = new Map()

  public highlighters: Map<number, HighlighterFn> = new Map()

  // Does the canvas contain machines or producers?
  private hasMachines = false
  private hasProducers = false

  /** Should the canvas be ticked continuously? */
  private continuous = false

  public setInstructionsPerTick(cycles: number) {
    this.ctx?.set_machine_clock_speed(cycles)
    $clock.setKey("instructionsPerTick", cycles)
  }

  public setCanvasBatchedTicks(cycles: number) {
    $clock.setKey("canvasBatchedTicks", cycles)
  }

  public async setup() {
    // Initialize the WebAssembly module.
    await setup()

    // Create the canvas controller instance from WebAssembly.
    this.ctx = Controller.create()
  }

  public load(
    id: number,
    source: string,
    config?: { reload?: boolean; invalidate?: boolean },
  ) {
    const { reload = false, invalidate = true } = config ?? {}

    // If the source is the same, we don't need to reload.
    if (this.sources.get(id) === source && !reload) {
      if (invalidate) this.invalidate()
      return
    }

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

  public reloadProgram(id: number) {
    const node = this.nodes.find((s) => s.data.id === id)
    if (!node) return

    if (isBlock.machine(node)) engine.load(id, node.data.source)
  }

  private setSyntaxError(id: number, error: unknown | null) {
    if (error) setError(id, error as CanvasError)
  }

  public inspect(id: number): InspectionState {
    return this.ctx?.inspect_machine(id)
  }

  private prepare = () => {
    if (this.ready) return

    this.ctx?.ready()
    this.ready = true

    clearPreviousRun(this)
  }

  private get isHalted(): boolean {
    if (this.continuous) return false

    return this.ctx?.is_halted() ?? false
  }

  get nodes() {
    return $nodes.get()
  }

  /**
   * Prepare the canvas for execution.
   * Initialize run variables when the run starts.
   **/
  public onRunStart() {
    // Reset the cycle counter.
    this.cycle = 0
    this.haltReason = null

    // Introspect the current state of the canvas.
    this.hasMachines = this.nodes.some(is.machine)
    this.hasProducers = this.nodes.some(is.producer)

    // Determine if we should run continuously.
    this.continuous =
      this.clock.canvasMs > 0 && (this.hasProducers || !isFinite(this.maxCycle))

    // Disable the watchdog if we have interactors, e.g., tap blocks.
    // Watchdog must be enabled if we are in real-time mode, otherwise the browser could hang.
    this.ctx?.set_await_watchdog(!this.continuous)

    // Prepare for the next run.
    this.prepare()
  }

  get clock() {
    return $clock.get()
  }

  /**
   * Cleanup the canvas after execution.
   */
  public onRunCleanup() {
    // Extra step to let the block tick
    this.step(1)

    // Perform effects and updates immediately after the final tick.
    this.syncAll()

    // Report that we have exceeded the execution cycle limit.
    if (this.cycle >= this.maxCycle) this.haltReason = "cycle"

    // Reset the watchdog.
    this.ctx?.set_await_watchdog(true)

    // Report if our program did not halt properly.
    if (!this.continuous) this.reportHang()
  }

  /** Tick the canvas. */
  public tick() {
    if (!this.continuous && this.cycle >= this.maxCycle) return
    if (this.shouldHalt()) return

    this.step()

    if (!this.continuous) this.cycle++

    return true
  }

  /** Check if we should halt the canvas. */
  private shouldHalt() {
    // If all machines are halted, we stop running.
    return this.haltIf(this.hasMachines && this.isHalted, "halted")
  }

  haltIf(condition: boolean, reason: HaltReason) {
    if (condition) this.haltReason = reason
    return condition
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
    if (status === "Awaiting") return { MessageNeverReceived: { id } }

    if (status === "Running") {
      switch (this.haltReason) {
        case "cycle":
          return { ExecutionCycleExceeded: { id } }
      }
    }
  }

  get statuses(): Map<number, MachineStatus> {
    return this.ctx?.statuses()
  }

  set halted(state: boolean) {
    $status.setKey("halted", state)
  }

  /**
   * Step the canvas a specified amount of time.
   * Used for the step button and the step command.
   **/
  public stepSlow = (count = 1) => {
    this.halted = false

    // Prepare for this run.
    this.prepare()

    // Step the canvas once.
    this.step(count)

    // Perform effects and updates immediately after stepping.
    this.syncAll()

    // If the current run is complete, cleanup.
    if (this.isHalted) this.reloadMachines()
  }

  /** Sync the effects after stepping or running. */
  private syncAll() {
    this.performSideEffects()
    this.syncMachineState()
    this.highlight()
    this.syncBlocks()
  }

  public syncMachineState() {
    syncMachineState(this)
  }

  private step(count = this.clock.canvasBatchedTicks) {
    try {
      this.ctx?.step(count)
    } catch (error) {
      this.detectCanvasError(error)
    }
  }

  // TODO(Perf): consume different types of effects separately?
  private consumeSideEffects(): Map<number, Effect[]> {
    return this.ctx?.consume_block_side_effects()
  }

  public performSideEffects() {
    const effects = this.consumeSideEffects()

    effects.forEach(processEffects)
  }

  // TODO(Perf): we can optimize this by only syncing the blocks that have changed.
  //             currently, we pull every data from the engine.
  public syncBlocks() {
    const blocks = this.ctx?.get_blocks()
    blocks.forEach(syncBlockData)
  }

  private updateBlock(id: number) {
    syncBlockData(this.ctx?.get_block(id))
  }

  private detectCanvasError(error: unknown) {
    const e = error as CanvasError

    console.warn("canvas error:", e)

    if (canvasErrors.disconnectedPort(e)) {
      const id = e.DisconnectedPort.port?.block
      setError(id, e)
      return
    }

    if (canvasErrors.machineError(e)) {
      const { cause } = e.MachineError

      const inner = Object.values(cause)[0]
      if (typeof inner?.id === "number") setError(inner.id, e)

      return
    }

    console.error("Unhandled canvas error:", error)
  }

  public highlight() {
    const output = $output.get()

    this.highlighters.forEach((highlight, id) => {
      const mapping = this.highlightMaps.get(id)
      const state = output[id]
      const pc = state?.registers?.pc ?? 0
      const lineNo = (mapping?.get(pc) ?? 0) + 1

      highlight(lineNo)
    })
  }

  private reloadMachines() {
    this.sources.forEach((source, id) => {
      this.load(id, source, { reload: true, invalidate: true })
    })
  }

  public reset() {
    // Invalidate the ready flag.
    this.invalidate()

    // Reset blocks and update UI
    this.ctx?.reset_blocks()
    this.syncBlocks()

    // Reset machines and update UI
    this.reloadMachines()
    this.syncMachineState()
  }

  public removeBlock(id: number) {
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

  public resetBlock(id: number) {
    this.ctx?.reset_block(id)
    this.updateBlock(id)
  }

  public send(id: number, action: Action) {
    this.ctx?.send_message_to_block(id, action)
  }
}

export const engine = new CanvasEngine()
await engine.setup()

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.engine = engine
