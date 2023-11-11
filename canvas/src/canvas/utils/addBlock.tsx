import { manager } from "../../core"
import { BlockTypes } from "../../types/Node"
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
      const id = manager.ctx?.add_block({ PixelBlock: { pixels: [] } })
      if (typeof id !== "number") return

      addCanvasNode(id, "pixel", { id, pixels: [] })
      return
    }

    case "tap": {
      const id = manager.ctx?.add_block({ TapBlock: {} })
      if (typeof id !== "number") return

      addCanvasNode(id, "tap", { id })
      return
    }
  }
}
