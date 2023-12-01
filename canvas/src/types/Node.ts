import { Node, NodeProps } from "reactflow"

import {
  ClockProps,
  MachineProps,
  MemoryProps,
  MidiInProps,
  MidiOutProps,
  OscProps,
  PixelProps,
  PlotterProps,
  SynthProps,
  TapProps,
} from "./blocks"

import type { ReactNode } from "react"

export interface BlockTypeMap {
  Machine: MachineProps
  Pixel: PixelProps
  Tap: TapProps
  Plot: PlotterProps
  Clock: ClockProps
  Osc: OscProps
  MidiIn: MidiInProps
  MidiOut: MidiOutProps
  Synth: SynthProps
  Memory: MemoryProps
}

export type BlockTypes = keyof BlockTypeMap
export type BlockValues = BlockTypeMap[BlockTypes]

export type BlockNode = Node<BlockValues, BlockTypes>
export type TNode<T extends BlockTypes> = Node<BlockTypeMap[T], T>

export type BlockComponentMap = {
  [N in BlockTypes]: (props: NodeProps<BlockTypeMap[N]>) => ReactNode
}
