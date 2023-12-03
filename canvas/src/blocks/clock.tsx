import { NodeProps } from "reactflow"

import { BaseBlock } from "@/blocks"
import { ClockProps } from "@/types/blocks"

export const ClockBlock = (props: NodeProps<ClockProps>) => {
  const time = props.data?.time?.toString()?.padStart(3, "0") ?? "000"

  return (
    <BaseBlock
      className="text-crimson-11 px-4 py-2 font-mono"
      node={props}
      sources={1}
    >
      t = {time}
    </BaseBlock>
  )
}
