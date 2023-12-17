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
  children?: ReactNode
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

  if (!node) return null

  return (
    <div className={cn("flex flex-col text-1 font-mono gap-y-2", className)}>
      {schema.fields.map((field) => {
        const { type, from, into } = field
        const data = node.data as BlockFieldOf<T>

        const key = field.key as string
        const name = field.title ?? key ?? "setting"

        let value = data[field.key] as unknown
        if (from) value = from(value)

        const set = (key: string, value: unknown) => {
          const v = into ? into(value) : value
          console.log(`set ${key} to`, v)

          update({ [key]: v } as never)
        }

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
            label: f.title ?? (f.key as string),
          }))

          const vt = value as { type: string }

          let val = ""

          if (value) {
            if (typeof value === "string") val = value
            else if (vt && vt.type) val = vt.type
          }

          const onChange = (next: string) => {
            if (typeof value === "string") {
              set(key, next)
            } else if (vt && vt.type) {
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
                size="1"
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
              <TextField.Input
                size="1"
                className="nodrag"
                value={value as string}
                onChange={(e) => set(key, e.target.value)}
              />
            </FieldGroup>
          )
        }

        return null
      })}

      {props.children}
    </div>
  )
}

export const FieldGroup = (props: { name: string; children: ReactNode }) => (
  <div className="grid grid-cols-2 gap-x-3">
    <div className="flex items-center capitalize">{props.name}</div>

    {props.children}
  </div>
)
