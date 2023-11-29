import { manager } from "../../core"
import { audioManager } from "../audio/manager"

import { $status } from "../../store/status"
import { profiler } from "./profiler"

const handlers = {
  start: async () => {
    await audioManager.ready()
    manager.onRunStart()
  },
  stop: async () => {
    manager.onRunCleanup()
  },
} as const

const updaters = {
  canvas() {
    const ok = manager.tick()
    if (!ok) scheduler.pause()
  },

  effect: () => manager.performSideEffects(),
  blocks: () => manager.syncBlocks(),
  machine: () => manager.syncMachineState(),
  highlight: () => manager.highlight(),
} as const

type Updater = keyof typeof updaters

type Timer = ReturnType<typeof setTimeout>

export class Scheduler {
  /** Request ID of the current animation frame. */
  frameRequestId = 0
  frame = 0

  timers: Partial<Record<Updater, Timer | null>> = {}

  get running() {
    return $status.value?.running ?? false
  }

  set running(value: boolean) {
    $status.setKey("running", value)
  }

  public start = async () => {
    this.running = true

    // Start the run.
    await handlers.start()

    this.schedule("canvas", 20)
    this.schedule("effect", 20)

    // Begin requesting animation frame.
    this.frame = 0
    this.frameRequestId = requestAnimationFrame(this.render)
  }

  /** Schedule a task every n milliseconds. */
  private schedule(type: Updater, wait: number) {
    const fn = this.fn(type)

    this.timers[type] = setInterval(fn, wait)
  }

  private clearTimers(...updaters: Updater[]) {
    updaters.forEach((updater) => {
      const timer = this.timers[updater]
      if (timer !== null) clearInterval(timer)

      this.timers[updater] = null
    })
  }

  public pause = () => {
    this.running = false
    this.clearTimers("canvas", "effect", "highlight", "machine")
    cancelAnimationFrame(this.frameRequestId)
  }

  /** The render loop updates the UI. */
  private render = () => {
    // Abort the render loop if the scheduler is not running.
    if (!this.running) return cancelAnimationFrame(this.frameRequestId)

    // TODO: update different block types at different rates. some might not need 60FPS?
    // TODO: adaptive FPS based on canvas heuristics.
    if (this.every(20)) this.update("highlight")
    else if (this.every(10)) this.update("machine")
    else this.update("blocks")

    // Increment the frame counter.
    this.frame++

    this.frameRequestId = requestAnimationFrame(this.render)
  }

  private fn(type: Updater) {
    const fn = updaters[type]
    if (profiler.enabled) return profiler.spy(type, fn)

    return fn
  }

  public update(type: Updater) {
    const fn = this.fn(type)

    return fn()
  }

  every(frame: number) {
    return this.frame % frame === 0
  }
}

export const scheduler = new Scheduler()
