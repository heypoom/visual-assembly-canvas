import { BlockData } from "machine-wasm"
import type { ReactNode } from "react"
import { Node, NodeProps } from "reactflow"

import { PaletteKey } from "@/blocks"

export type BlockTypes = Block["type"]

export type Block =
  | Exclude<BlockData, { type: "Machine" | "Pixel" }>
  | (Extract<BlockData, { type: "Machine" }> & { source: string })
  | (Extract<BlockData, { type: "Pixel" }> & {
      columns?: number
      palette?: PaletteKey
    })

export type BaseBlockPropsOf<K extends BlockTypes> = Omit<
  Extract<Block, { type: K }>,
  "type"
>

export type BlockPropsOf<K extends BlockTypes> = BaseBlockPropsOf<K> & {
  id: number
}

export type BlockTypeMap = {
  [K in BlockTypes]: BlockPropsOf<K>
}

export type BlockValues = BlockTypeMap[BlockTypes]

export type BlockNode = Node<BlockValues, BlockTypes>
export type TNode<T extends BlockTypes> = Node<BlockTypeMap[T], T>

export type BlockComponentMap = {
  [N in BlockTypes]: (props: NodeProps<BlockTypeMap[N]>) => ReactNode
}
