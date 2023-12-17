import { useStore } from "@nanostores/react"
import { TextField } from "@radix-ui/themes"
import { ReactNode, useMemo } from "react"

import { BlockKeys, Field, SchemaOf } from "@/blocks/types/schema"
import { engine } from "@/engine"
import { $nodes } from "@/store/nodes"
import { BlockFieldOf, BlockTypes } from "@/types/Node"
import { RadixSelect } from "@/ui"

type Props<T extends BlockTypes, F extends Field<T, BlockKeys<T>>> = {
  id: number
  schema: SchemaOf<T, F>
  onUpdate?: () => void
}

export const Settings = <
  T extends BlockTypes,
  F extends Field<T, BlockKeys<T>>,
>(
  props: Props<T, F>,
) => {
  const { id, schema } = props

  const nodes = useStore($nodes)
  const node = useMemo(() => nodes.find((n) => n.data.id === id), [id, nodes])

  const update = (data: Partial<BlockFieldOf<T>>) => {
    engine.setBlock(id, schema.type, data)
    props.onUpdate?.()
  }

  if (!node) return null

  return (
    <div className="flex flex-col px-2 text-1 font-mono pb-2 gap-y-2">
      {schema.fields.map((field) => {
        const { type } = field
        const data = node.data as BlockFieldOf<T>

        const key = field.key as string
        const value = data[field.key]
        const name = field.title ?? key ?? "setting"

        if (type === "number") {
          const { min = 0, max = 1000000 } = field

          return (
            <FieldGroup key={key} name={name}>
              <TextField.Input
                type="number"
                min={min}
                max={max}
                size="1"
                value={value?.toString()}
                onChange={(e) => {
                  const n = parseInt(e.target.value)
                  if (n < min) return
                  if (n > max) return

                  update({ [key]: n } as never)
                }}
              />
            </FieldGroup>
          )
        }

        if (type === "select") {
          const options = field.options.map((f) => ({
            value: f.key as string,
            label: f.title,
          }))

          const vt = value as { type: string }

          let val = ""
          if (typeof value === "string") val = value
          if ("type" in vt) val = vt.type

          const onChange = (next: string) => {
            if (typeof value === "string") {
              update({ [key]: next } as never)
            }

            if ("type" in vt) {
              const option = field.options.find((o) => o.key === next)

              // TODO: handle enums with additional fields
              update({
                [key]: { type: next, ...option?.defaults },
              } as never)
            }
          }

          return (
            <FieldGroup key={key} name={name}>
              <RadixSelect onChange={onChange} options={options} value={val} />
            </FieldGroup>
          )
        }

        if (type === "text") {
          return (
            <FieldGroup key={key} name={name}>
              {type}
            </FieldGroup>
          )
        }

        return null
      })}
    </div>
  )
}

const FieldGroup = (props: { name: string; children: ReactNode }) => (
  <div className="grid grid-cols-2">
    <div className="flex items-center">{props.name}</div>

    {props.children}
  </div>
)
