import RingBuffer from "ringbufferjs"

const MAX_LOGS = 100

const [W, H] = [600, 200]

const colors: Record<string, string> = {
  canvas: "orange",
  effect: "lime",

  blocks: "cyan",
  machine: "pink",
  highlight: "teal",
}

export class Profiler {
  ready = false
  enabled = true
  logs: Map<string, RingBuffer<number>> = new Map()

  hide: Record<string, boolean> = {
    highlight: true,
  }

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
    root.style.flexDirection = "column"
    root.style.bottom = "0"
    root.style.right = "0"
    root.style.width = `${W / 2}px`
    root.style.height = `${H / 2}px`
    document.body.appendChild(root)

    this.chartRoot = root
    this.ready = true
  }

  log = (key: string, value: number) => {
    if (!this.logs.has(key)) this.logs.set(key, new RingBuffer(MAX_LOGS))

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

  draw(name: string) {
    if (!this.chartElements.has(name)) this.addChart(name)

    const canvas = this.chartElements.get(name)
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, W, H)

    const keys = Array.from(this.logs.keys())
    const max = Math.max(...keys.map((key) => this.logs.get(key)?.peek() ?? 0))

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      if (this.hide[key]) continue

      const color = colors[key] || "white"

      const log = this.logs.get(key)
      if (!log) continue

      const values = log.peekN(log.size())
      const step = W / values.length

      ctx.beginPath()
      ctx.strokeStyle = color
      ctx.lineWidth = 3
      ctx.moveTo(0, H)

      for (let j = 0; j < values.length; j++) {
        const value = values[j]
        const x = j * step
        const y = H - (value / max) * H

        ctx.lineTo(x, y)
      }

      ctx.stroke()
    }
  }

  start = () => {
    if (!this.enabled) return

    requestAnimationFrame(this.loop)
  }

  loop = () => {
    if (!this.enabled) return cancelAnimationFrame(this.requestFrameId)

    if (this.frame % 20) this.draw("base")

    this.frame++
    this.requestFrameId = requestAnimationFrame(this.loop)
  }

  stop = () => {
    cancelAnimationFrame(this.requestFrameId)
  }
}

export const profiler = new Profiler()

window.profiler = profiler
