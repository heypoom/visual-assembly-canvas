import { BlockNode } from "../types/Node"
import { isBlock } from "../blocks"
import { audioManager } from "../services/audio/manager"

export function setupBlock(block: BlockNode) {
  const { id } = block.data

  if (isBlock.synth(block)) {
    audioManager.add(id, block.data.config)
  }
}
