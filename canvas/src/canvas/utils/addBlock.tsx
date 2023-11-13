import { manager } from "../../core"
import { BlockTypeMap, BlockTypes } from "../../types/Node"
import { defaultProps, DEFAULT_SOURCE } from "../blocks/utils/defaults"
import { addCanvasNode } from "./addCanvasNode"

export function addBlock<T extends BlockTypes>(type: T) {
  if (type === "MachineBlock") return addMachine()

  const props = defaultProps[type]
  const id = manager.ctx?.add_block({ [type]: props })
  if (typeof id !== "number") return

  addCanvasNode(id, type, { ...props, id } as BlockTypeMap[T])
}

export function addMachine() {
  const id = manager.ctx?.add_machine()
  if (typeof id !== "number") return

  manager.load(id, DEFAULT_SOURCE)
  addCanvasNode(id, "MachineBlock", { id, source: DEFAULT_SOURCE })
}
