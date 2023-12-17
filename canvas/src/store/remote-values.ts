import { map } from "nanostores"

import { isBlock } from "@/blocks"
import { engine } from "@/engine"
import { $nodes } from "@/store/nodes"

// Mapping between remote value block id and remote values
export type RemoteValueMap = Record<number, number[]>

export const $remoteValues = map<RemoteValueMap>({})

export function updateValueViewers() {
  for (const node of $nodes.get()) {
    if (!isBlock.valueView(node)) continue

    const { id, offset, size, target } = node.data

    const buf = engine.ctx.read_mem(target, offset, size) as number[]
    $remoteValues.setKey(id, buf)
  }
}
