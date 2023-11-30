import { engine } from "../../engine"
import { BlockTypeMap, BlockTypes } from "../../types/Node"
import { defaultProps, DEFAULT_SOURCE } from "../blocks"
import { addCanvasNode } from "./addCanvasNode"
import { setupBlock } from "../../persist/setupBlock"

export function addBlock<T extends BlockTypes>(type: T) {
  if (type === "Machine") return addMachine()

  const props = defaultProps[type]
  const id = engine.ctx?.add_block({ [type]: props })
  if (typeof id !== "number") return

  const data = { ...props, id } as BlockTypeMap[T]

  const node = addCanvasNode(id, type, data)
  setupBlock(node)
}

export function addMachine() {
  const id = engine.ctx?.add_machine()
  if (typeof id !== "number") return

  engine.load(id, DEFAULT_SOURCE)
  addCanvasNode(id, "Machine", { id, source: DEFAULT_SOURCE })
}
