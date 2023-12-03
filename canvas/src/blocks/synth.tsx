import { NodeProps } from "reactflow"

import { SynthProps } from "@/types/blocks"

import { BlockHandle } from "./components/BlockHandle"

export const SynthBlock = (props: NodeProps<SynthProps>) => {
  const { config } = props.data ?? {}
  const name = typeof config === "string" ? config : Object.keys(config)?.[0]

  return (
    <div>
      <BlockHandle port={1} side="left" type="target" />

      <div className="px-4 py-2 border-2 rounded-2 font-mono">
        <div>{name} Synth</div>
      </div>

      <BlockHandle port={0} side="right" type="source" />
    </div>
  )
}
