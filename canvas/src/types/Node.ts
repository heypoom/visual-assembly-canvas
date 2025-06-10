import { InternalBlockData } from "machine-wasm"
import type { ReactNode } from "react"
import { Node, NodeProps } from "reactflow"

import { PaletteKey } from "@/blocks"

export type BlockTypes = Block["type"]

export type InternalBlock =
  | Exclude<InternalBlockData, { type: "Machine" | "Pixel" | "Tap" }>
  | (Extract<InternalBlockData, { type: "Machine" }> & { source: string })
  | (Extract<InternalBlockData, { type: "Tap" }> & { signal: number[] })
  | (Extract<InternalBlockData, { type: "Pixel" }> & {
      columns?: number
      palette?: PaletteKey
    })

export type ExternalBlock = { type: "P5"; source: string }

export type Block = InternalBlock | ExternalBlock

export type BaseBlockFieldOf<K extends BlockTypes> = Omit<
  Extract<Block, { type: K }>,
  "type"
>

export type BlockFieldOf<K extends BlockTypes> = BaseBlockFieldOf<K> & {
  id: number
}

export type BlockPropsOf<K extends BlockTypes> = NodeProps<BlockFieldOf<K>>

export type BlockTypeMap = {
  [K in BlockTypes]: BlockFieldOf<K>
}

export type BlockValues = BlockTypeMap[BlockTypes]

export type BlockNode = Node<BlockFieldOf<BlockTypes>, BlockTypes>
export type TNode<T extends BlockTypes> = Node<BlockFieldOf<T>, T>

export type BlockComponentMap = {
  [T in BlockTypes]: (props: BlockPropsOf<T>) => ReactNode
}
