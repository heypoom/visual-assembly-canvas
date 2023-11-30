import RingBuffer from "ringbufferjs"

const [W, H] = [200, 100]

const colors: Record<string, string> = {
  canvas: "#3DD68C",
  effect: "#70B8FF",
  blocks: "#FF92AD",
  machine: "#B1A9FF",
  highlight: "#FFFF57",
}

const ranges: Record<string, [number, number]> = {
  canvas: [0.1, 0.8],
  effect: [0.1, 0.8],

  blocks: [0.1, 0.8],
  machine: [0.1, 0.8],
  highlight: [0.1, 0.8],
}

export class Profiler {
  ready = false
  enabled = true
  logs: Map<string, RingBuffer<number>> = new Map()

  maxLogs = 100

  hide: Record<string, boolean> = {}

  frame = 0
  requestFrameId = 0

  chartRoot: HTMLDivElement | null = null
  chartElements: Map<string, HTMLCanvasElement> = new Map()

  constructor() {
    this.setup()
    this.start()
  }

  setup() {
    if (!this.enabled || this.ready) return

    const root = document.createElement("div")
    root.setAttribute("data-profiler-root", "true")
    root.style.pointerEvents = "none"
    root.style.position = "fixed"
    root.style.display = "flex"
    root.style.alignItems = "flex-end"
    root.style.bottom = "0"
    root.style.right = "0"
    root.style.width = `100%`
    document.body.appendChild(root)

    this.chartRoot = root
    this.ready = true
  }

  log = (key: string, value: number) => {
    if (!this.logs.has(key)) this.logs.set(key, new RingBuffer(this.maxLogs))

    this.logs.get(key)?.enq(value)
  }

  spy = <T extends (...args: any[]) => any>(key: string, fn: T): T => {
    if (!this.enabled) return fn

    const spy = (...args: Parameters<T>) => {
      if (!this.enabled) return fn(...args)

      const start = performance.now()
      const result = fn(...args)
      const end = performance.now()
      const duration = end - start

      this.log(key, duration)

      return result
    }

    return spy as T
  }

  addChart(name: string) {
    if (!this.chartRoot) return
    if (this.chartElements.has(name)) return

    const chart = document.createElement("canvas")
    chart.setAttribute("data-profiler-chart", "true")
    chart.setAttribute("data-profiler-name", name)
    chart.width = W
    chart.height = H
    chart.style.width = `${W}px`
    chart.style.height = `${H}px`

    this.chartRoot?.appendChild(chart)
    this.chartElements.set(name, chart)
  }

  draw(key: string) {
    if (this.hide[key]) return

    this.addChart(key)

    const canvas = this.chartElements.get(key)
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, W, H)

    const log = this.logs.get(key)
    if (!log) return

    const values = log.peekN(log.size())
    const step = W / values.length

    const [defMin, warnMax] = ranges[key] ?? [-Infinity, Infinity]

    const maxVal = Math.max(...values) ?? 0

    const color = colors[key] || "white"

    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineWidth = 3

    if (maxVal > warnMax) {
      ctx.strokeStyle = "#E54D2E"
      ctx.lineWidth = 4

      console.log(`[${key}] ${maxVal} exceeds ${warnMax}`)
    }

    ctx.moveTo(0, H)

    for (let j = 0; j < values.length; j++) {
      let value = values[j]
      if (value < defMin) value = defMin

      const x = j * step
      const y = H - ((value - defMin) / warnMax) * H

      ctx.lineTo(x, y)
    }

    ctx.stroke()
  }

  start = () => {
    if (!this.enabled) return

    requestAnimationFrame(this.loop)
  }

  loop = () => {
    if (!this.enabled) return cancelAnimationFrame(this.requestFrameId)

    if (this.frame % 20) {
      for (const key of this.logs.keys()) this.draw(key)
    }

    this.frame++
    this.requestFrameId = requestAnimationFrame(this.loop)
  }

  stop = () => {
    cancelAnimationFrame(this.requestFrameId)
  }

  public getCurrentMax() {
    const entries = [...this.logs.entries()].map(([key, log]) => {
      const values = log.peekN(log.size())
      const max = Math.max(...values)

      return [key, max]
    })

    return Object.fromEntries(entries)
  }
}

export const profiler = new Profiler()

window.profiler = profiler
