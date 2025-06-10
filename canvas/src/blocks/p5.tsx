import { memo } from "react"

import { BaseBlock, createSchema } from "@/blocks"
import { BlockPropsOf } from "@/types/Node"

type TapProps = BlockPropsOf<"P5">

export const P5Block = memo((props: TapProps) => {
  return (
    <BaseBlock
      node={props}
      sources={1}
      className=""
      schema={schema}
      settingsConfig={{
        className: "",
      }}
    >
      P5.js
    </BaseBlock>
  )
})

const schema = createSchema({
  type: "P5",
  fields: [{ key: "source", type: "text" }],
})
