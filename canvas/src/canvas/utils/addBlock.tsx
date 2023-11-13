import { manager } from "../../core"
import { BlockTypes } from "../../types/Node"
import { PixelMode } from "../../types/blocks"
import { addCanvasNode } from "./addCanvasNode"

const DEFAULT_SOURCE = "push 0xAA\n\n\n\n"

export function addBlock<T extends BlockTypes>(type: T) {
  switch (type) {
    case "machine": {
      const id = manager.ctx?.add_machine()
      if (typeof id !== "number") return

      manager.load(id, DEFAULT_SOURCE)
      addCanvasNode(id, "machine", { id, source: DEFAULT_SOURCE })
      return
    }

    case "pixel": {
      const props = { pixels: [], mode: "Replace" as PixelMode }
      const id = manager.ctx?.add_block({
        PixelBlock: props,
      })

      if (typeof id !== "number") return

      addCanvasNode(id, "pixel", { ...props, id })
      return
    }

    case "tap": {
      const id = manager.ctx?.add_block({ TapBlock: {} })
      if (typeof id !== "number") return

      addCanvasNode(id, "tap", { id, signal: [1] })
      return
    }

    case "osc": {
      const props = { time: 0, values: [], waveform: { Sine: null } }
      const id = manager.ctx?.add_block({ OscBlock: props })
      if (typeof id !== "number") return

      addCanvasNode(id, "osc", { id, ...props })
      return
    }

    case "plotter": {
      const props = { values: [], size: 250 }
      const id = manager.ctx?.add_block({ PlotterBlock: props })
      if (typeof id !== "number") return

      addCanvasNode(id, "plotter", { id, ...props })
      return
    }
  }
}
