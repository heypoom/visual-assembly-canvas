import { useStore } from "@nanostores/react"

import { BaseBlock } from "@/blocks"
import { engine } from "@/engine"
import { updateNodeData } from "@/store/blocks"
import { $remoteValues } from "@/store/remote-values"
import { BlockPropsOf } from "@/types/Node"

type Props = BlockPropsOf<"ValueView">
type Data = Props["data"]

export const ValueViewBlock = (props: Props) => {
  const { id, target, offset, size, visual } = props.data
  const valueMap = useStore($remoteValues)
  const values = valueMap[id] ?? []

  const update = (config: Partial<Data>) => {
    const data = { ...props.data, ...config }

    engine.ctx.update_block(id, { type: "ValueView", ...data })
    updateNodeData(id, data)
  }

  window.vvUpdater = update

  return (
    <BaseBlock node={props} className="px-4 py-3">
      <code>{values.join(", ")}</code>

      <code className="text-1 text-gray-8">
        o={offset}, s={size}, t={target}
      </code>
    </BaseBlock>
  )
}
