import { BlockNode } from "../types/Node"
import { isBlock } from "../canvas/blocks"
import { audioManager } from "../services/audio/manager"

export function setupBlock(block: BlockNode) {
  const id = Number(block.id)

  if (isBlock.synth(block)) {
    audioManager.add(id, block.data.config)
  }
}
