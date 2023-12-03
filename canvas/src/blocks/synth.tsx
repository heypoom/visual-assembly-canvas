import { NodeProps } from "reactflow"

import { BaseBlock } from "@/blocks"
import { SynthProps } from "@/types/blocks"

export const SynthBlock = (props: NodeProps<SynthProps>) => {
  const { config } = props.data ?? {}
  const name = typeof config === "string" ? config : Object.keys(config)?.[0]

  return (
    <BaseBlock
      node={props}
      sources={1}
      targets={1}
      className="px-4 py-2 font-mono"
    >
      {name} Synth
    </BaseBlock>
  )
}
