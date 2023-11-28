import { manager } from "../../core"
import { BlockTypeMap, BlockTypes } from "../../types/Node"
import { defaultProps, DEFAULT_SOURCE } from "../blocks"
import { addCanvasNode } from "./addCanvasNode"
import { audioManager } from "../../audio/manager"

export function addBlock<T extends BlockTypes>(type: T) {
  if (type === "Machine") return addMachine()

  const props = defaultProps[type]
  const id = manager.ctx?.add_block({ [type]: props })
  if (typeof id !== "number") return

  if (type === "Synth") {
    audioManager.setup(id, defaultProps.Synth.config)
  }

  addCanvasNode(id, type, { ...props, id } as BlockTypeMap[T])
}

export function addMachine() {
  const id = manager.ctx?.add_machine()
  if (typeof id !== "number") return

  manager.load(id, DEFAULT_SOURCE)
  addCanvasNode(id, "Machine", { id, source: DEFAULT_SOURCE })
}
