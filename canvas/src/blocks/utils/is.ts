import { BlockNode, BlockTypes, TNode } from "../../types/Node"

export const isBlockType =
  <T extends BlockTypes>(key: T) =>
  (node: BlockNode): node is TNode<T> =>
    node.type === key

export const isBlock = {
  machine: isBlockType("Machine"),
  pixel: isBlockType("Pixel"),
  tap: isBlockType("Tap"),
  osc: isBlockType("Osc"),
  synth: isBlockType("Synth"),
  clock: isBlockType("Clock"),
  plot: isBlockType("Plot"),
  midiIn: isBlockType("MidiIn"),
  midiOut: isBlockType("MidiOut"),
  producer: (n: BlockNode) =>
    isBlock.clock(n) || isBlock.midiIn(n) || isBlock.tap(n),
}
