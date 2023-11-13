import { Edge } from "reactflow"
import { atom, computed } from "nanostores"

import { BlockNode } from "../types/Node"

export const $nodes = atom<BlockNode[]>([])
export const $edges = atom<Edge[]>([])
export const $hasBlocks = computed($nodes, (n) => n.length > 0)
