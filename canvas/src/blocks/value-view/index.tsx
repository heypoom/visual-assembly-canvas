import { useStore } from "@nanostores/react"
import cn from "classnames"
import { memo } from "react"

import { BaseBlock } from "@/blocks"
import { Settings } from "@/blocks/components/Settings"
import { createSchema } from "@/blocks/types/schema"
import { bitsToList } from "@/blocks/value-view/utils/bits-to-list"
import { $remoteValues } from "@/store/remote-values"
import { BlockPropsOf } from "@/types/Node"

type Props = BlockPropsOf<"ValueView">
// type Data = Props["data"]

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
        { key: "Switches", title: "Switch" },
        { key: "ColorGrid", title: "Color Grid" },
        { key: "String", title: "String" },
      ],
    },
    { key: "target", type: "number", min: 0 },
  ],
})

export const ValueViewBlock = memo((props: Props) => {
  const { id, target, offset, size, visual } = props.data
  const valueMap = useStore($remoteValues)
  const values = valueMap[id] ?? []

  // const update = (config: Partial<Data>) =>
  //   engine.setBlock(id, "ValueView", config)

  const hx = (n: number) => n.toString(16).padStart(4, "0").toUpperCase()

  const display = () => {
    const { type } = visual

    switch (type) {
      case "Int": {
        return (
          <div className="grid grid-cols-8 font-mono gap-x-2 px-2 py-1">
            {values.map((v, i) => (
              <div key={i}>{v}</div>
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

  return (
    <BaseBlock
      node={props}
      settings={() => <Settings schema={schema} />}
      className="relative font-mono"
    >
      {display()}

      <div className="text-[8px] text-gray-8 absolute font-mono bottom-[-16px] flex min-w-[100px]">
        o=0x{hx(offset)} s={size} t={target}
      </div>
    </BaseBlock>
  )
})
