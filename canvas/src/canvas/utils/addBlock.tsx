import { manager } from "../../core"
import { BlockTypeMap, BlockTypes } from "../../types/Node"
import { addCanvasNode } from "./addCanvasNode"

const DEFAULT_SOURCE = "push 0xAA\n\n\n\n"

type DefaultPropsMap = {
  [T in BlockTypes]: Omit<BlockTypeMap[T], "id">
}

export const defaultProps: DefaultPropsMap = {
  machine: { source: DEFAULT_SOURCE },
  pixel: { pixels: [], mode: "Replace" },
  tap: { signal: [1] },
  osc: { time: 0, waveform: { Sine: null } },
  plotter: { values: [], size: 250 },
}

// TODO: unify this!
export const blockKeys: Record<BlockTypes, string> = {
  machine: "MachineBlock",
  pixel: "PixelBlock",
  tap: "TapBlock",
  plotter: "PlotterBlock",
  osc: "OscBlock",
}

export function addBlock<T extends BlockTypes>(type: T) {
  if (type === "machine") return addMachine()

  const key = blockKeys[type]
  const props = defaultProps[type]
  const id = manager.ctx?.add_block({ [key]: props })
  if (typeof id !== "number") return

  addCanvasNode(id, type, { ...props, id } as BlockTypeMap[T])
}

export function addMachine() {
  const id = manager.ctx?.add_machine()
  if (typeof id !== "number") return

  manager.load(id, DEFAULT_SOURCE)
  addCanvasNode(id, "machine", { id, source: DEFAULT_SOURCE })
}
