import { useStore } from "@nanostores/react"
import cn from "classnames"
import { memo } from "react"

import { BaseBlock, createSchema } from "@/blocks"
import { bitsToList } from "@/blocks/value-view/utils/bits-to-list"
import { $remoteValues, updateValueViewers } from "@/store/remote-values"
import { BlockPropsOf } from "@/types/Node"

type Props = BlockPropsOf<"ValueView">

export const ValueViewBlock = memo((props: Props) => {
  const { id, target, offset, size, visual } = props.data
  const valueMap = useStore($remoteValues)
  const values = valueMap[id] ?? []

  const hx = (n: number) => n.toString(16).padStart(4, "0").toUpperCase()

  const display = () => {
    const { type } = visual

    if (values.length === 0) {
      return (
        <div className="px-4 py-2 font-mono text-gray-9">missing value</div>
      )
    }

    switch (type) {
      case "Int": {
        return (
          <div className="grid grid-cols-8 font-mono gap-x-2 px-2 py-1 text-2">
            {values.map((v, i) => (
              <div
                key={i}
                className={cn("text-center", v === 0 && "text-gray-7")}
              >
                {v}
              </div>
            ))}
          </div>
        )
      }

      case "ColorGrid": {
        const groups = bitsToList(values)

        return (
          <div className="flex flex-col">
            {groups.map((group, i) => (
              <div key={i} className="grid grid-cols-8">
                {group.map((bit, j) => (
                  <div
                    key={j}
                    className={cn(
                      "px-2 py-2",
                      bit ? "bg-gray-12" : "transparent",
                    )}
                  />
                ))}
              </div>
            ))}
          </div>
        )
      }
    }

    return <div className="px-2 py-1 text-red-11">unknown visual: {type}</div>
  }

  const handleUpdate = () => updateValueViewers()

  return (
    <BaseBlock
      node={props}
      className="relative font-mono"
      schema={schema}
      settingsConfig={{ onUpdate: handleUpdate, className: "px-3 pb-2" }}
    >
      {display()}

      <div className="text-[8px] text-gray-8 absolute font-mono bottom-[-16px] flex min-w-[100px]">
        o=0x{hx(offset)} s={size} t={target}
      </div>
    </BaseBlock>
  )
})

const schema = createSchema({
  type: "ValueView",
  fields: [
    { key: "size", type: "number", min: 1 },
    { key: "offset", type: "number", min: 0 },
    {
      key: "visual",
      type: "select",
      options: [
        { key: "Int", title: "Number" },
        { key: "Bytes", title: "Byte View" },
        { key: "Switches", title: "Switch", defaults: { bits: [] } },
        { key: "ColorGrid", title: "Binary Grid" },
        { key: "String" },
      ],
    },
    { key: "target", type: "number", min: 0 },
  ],
})
