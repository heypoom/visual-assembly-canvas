import { defaultProps } from "@/blocks"
import { setupBlock } from "@/blocks"
import { addCanvasNode } from "@/canvas"
import { engine } from "@/engine"
import { BlockTypeMap, BlockTypes } from "@/types/Node"

interface Options<T extends BlockTypes> {
  position?: { x: number; y: number }
  data?: Partial<BlockTypeMap[T]>
}

export function addBlock<T extends BlockTypes>(type: T, options?: Options<T>) {
  const props = { ...defaultProps[type], ...options?.data }

  let id: number | undefined

  if (type === "Machine") {
    id = engine.ctx?.add_machine()
  } else {
    id = engine.ctx?.add_block({ type, ...props })
  }

  if (typeof id !== "number") return

  const data = { ...props, id } as BlockTypeMap[T]

  setupBlock(addCanvasNode(id, type, data, options))
}
