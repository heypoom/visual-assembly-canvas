import { measureFps } from "./utils/measureFps"

export class Scheduler {
  /** Maximum FPS that the browser can handle. */
  maxFPS = 60

  constructor() {}

  async setup() {
    this.maxFPS = await measureFps()
  }

  onComputeTick() {}
}

export const scheduler = new Scheduler()
