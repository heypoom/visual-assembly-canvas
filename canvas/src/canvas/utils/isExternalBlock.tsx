import { BlockTypes } from "@/types/Node"

export const EXTERNAL_BLOCKS = new Set<BlockTypes>(["P5"])

export const isExternalBlock = <T extends BlockTypes>(type: T) =>
  EXTERNAL_BLOCKS.has(type)
