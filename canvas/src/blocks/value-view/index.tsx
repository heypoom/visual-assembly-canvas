import { useStore } from "@nanostores/react"
import { memo } from "react"

import { BaseBlock, createSchema } from "@/blocks"
import { ValueRenderer } from "@/blocks/value-view/components/ValueRenderer"
import { $remoteValues, updateValueViewers } from "@/store/remote-values"
import { BlockPropsOf } from "@/types/Node"

type Props = BlockPropsOf<"ValueView">

const hx = (n: number) => n.toString(16).padStart(4, "0").toUpperCase()

export const ValueViewBlock = memo((props: Props) => {
  const { id, target, offset, size, visual } = props.data

  const valueMap = useStore($remoteValues)
  const values = valueMap[id] ?? []

  return (
    <BaseBlock
      node={props}
      className="relative font-mono"
      schema={schema}
      settingsConfig={{ onUpdate: updateValueViewers, className: "px-3 pb-2" }}
    >
      <ValueRenderer {...{ values, visual, target, offset }} />

      <div className="text-[8px] text-gray-8 absolute font-mono bottom-[-16px] flex min-w-[100px]">
        o=0x{hx(offset)} s={size} t={target}
      </div>
    </BaseBlock>
  )
})

const schema = createSchema({
  type: "ValueView",
  fields: [
    {
      key: "visual",
      type: "select",
      options: [
        { key: "Int", title: "Number" },
        { key: "Bytes", title: "Hex" },
        { key: "Switches", title: "Switch", defaults: { bits: [] } },
        { key: "ColorGrid", title: "Binary Grid" },
        { key: "String" },
      ],
    },

    { key: "size", type: "number", min: 1 },
    { key: "offset", type: "number", min: 0 },
    { key: "target", type: "number", min: 0 },
  ],
})
