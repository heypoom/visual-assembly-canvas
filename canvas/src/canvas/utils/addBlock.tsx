import { InternalBlockData } from "machine-wasm"

import { getDefaultProps } from "@/blocks"
import { setupBlock } from "@/blocks"
import { addCanvasNode } from "@/canvas"
import { engine } from "@/engine"
import { BaseBlockFieldOf, BlockFieldOf, BlockTypes } from "@/types/Node"
import { isExternalBlock } from "./isExternalBlock"

interface Options<T extends BlockTypes> {
  position?: { x: number; y: number }
  data?: Partial<BaseBlockFieldOf<T>>
}

export function addBlock<T extends BlockTypes>(type: T, options?: Options<T>) {
  console.log("addBlock", type, options)

  const props: BaseBlockFieldOf<T> = {
    ...getDefaultProps(type),
    ...options?.data,
  }

  let id: number | undefined

  if (type === "Machine") {
    id = engine.ctx?.add_machine()
  } else if (isExternalBlock(type)) {
    id = engine.addExternalBlock(type, null)
  } else {
    id = engine.ctx?.add_block({
      type: "BuiltIn",
      data: { type, ...props } as InternalBlockData,
    })
  }

  if (typeof id !== "number") return

  const data = { ...props, id } as BlockFieldOf<T>
  setupBlock(addCanvasNode(id, type, data, options))
}
