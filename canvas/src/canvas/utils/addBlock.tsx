import { engine } from "../../engine"
import { BlockTypeMap, BlockTypes } from "../../types/Node"
import { defaultProps, DEFAULT_SOURCE } from "../blocks"
import { addCanvasNode } from "./addCanvasNode"
import { audioManager } from "../../services/audio/manager"

export function addBlock<T extends BlockTypes>(type: T) {
  if (type === "Machine") return addMachine()

  const props = defaultProps[type]
  const id = engine.ctx?.add_block({ [type]: props })
  if (typeof id !== "number") return

  if (type === "Synth") {
    audioManager.add(id, defaultProps.Synth.config)
  }

  addCanvasNode(id, type, { ...props, id } as BlockTypeMap[T])
}

export function addMachine() {
  const id = engine.ctx?.add_machine()
  if (typeof id !== "number") return

  engine.load(id, DEFAULT_SOURCE)
  addCanvasNode(id, "Machine", { id, source: DEFAULT_SOURCE })
}
