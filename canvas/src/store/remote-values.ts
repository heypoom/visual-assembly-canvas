import { computed, map } from "nanostores"

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

export type MemoryRegion = { id: number; offset: number; size: number }
type RegionMap = Record<number, MemoryRegion[]>

export const $memoryRegions = computed($nodes, (nodes) => {
  const viewers: RegionMap = {}

  for (const node of nodes) {
    if (!isBlock.valueView(node)) continue

    const { id, target, size, offset } = node.data

    if (!viewers[target]) viewers[target] = []
    viewers[target].push({ id, size, offset })
  }

  return viewers
})
