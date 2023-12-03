import { BlockNode } from "../../types/Node"
import { isBlock } from "../../blocks"
import { audioManager } from "../../services/audio/manager"
import { engine } from "../../engine"

export function setupBlock(block: BlockNode) {
  const { id } = block.data

  if (isBlock.machine(block)) {
    engine.load(id, block.data.source)
  }

  if (isBlock.synth(block)) {
    audioManager.add(id, block.data.config)
  }
}
