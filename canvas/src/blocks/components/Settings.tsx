import { useStore } from "@nanostores/react"
import { Checkbox, TextField } from "@radix-ui/themes"
import cn from "classnames"
import { ReactNode, useMemo } from "react"

import { BlockKeys, Field, SchemaOf } from "@/blocks/types/schema"
import { engine } from "@/engine"
import { $nodes } from "@/store/nodes"
import { BlockFieldOf, BlockTypes } from "@/types/Node"
import { RadixSelect } from "@/ui"

type Props<T extends BlockTypes, F extends Field<T, BlockKeys<T>>> = {
  id: number
  schema: SchemaOf<T, F>
  className?: string
  onUpdate?: () => void
}

export const Settings = <
  T extends BlockTypes,
  F extends Field<T, BlockKeys<T>>,
>(
  props: Props<T, F>,
) => {
  const { id, schema, className } = props

  const nodes = useStore($nodes)
  const node = useMemo(() => nodes.find((n) => n.data.id === id), [id, nodes])

  const update = (data: Partial<BlockFieldOf<T>>) => {
    engine.setBlock(id, schema.type, data)
    props.onUpdate?.()
  }

  const set = (key: string, value: unknown) => update({ [key]: value } as never)

  if (!node) return null

  return (
    <div className={cn("flex flex-col text-1 font-mono gap-y-2", className)}>
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
                  if (isNaN(n)) return
                  if (n < min) return
                  if (n > max) return

                  set(key, n)
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
            if (typeof value === "string") set(key, next)

            if ("type" in vt) {
              const opt = field.options.find((o) => o.key === next)

              set(key, { type: next, ...opt?.defaults })
            }
          }

          return (
            <FieldGroup key={key} name={name}>
              <RadixSelect onChange={onChange} options={options} value={val} />
            </FieldGroup>
          )
        }

        if (type === "checkbox") {
          return (
            <FieldGroup key={key} name={name}>
              <Checkbox
                color="crimson"
                checked={value as boolean}
                onCheckedChange={(next) => {
                  if (next === "indeterminate") return

                  set(key, next)
                }}
              />
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
  <div className="grid grid-cols-2 gap-x-3">
    <div className="flex items-center capitalize">{props.name}</div>

    {props.children}
  </div>
)
