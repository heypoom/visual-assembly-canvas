import { SchemaOf } from "@/blocks/types/schema"

// eslint-disable-next-line
type SS = SchemaOf<any, any>

type Props<S extends SS> = {
  schema: S
}

export const Settings = <S extends SS>(props: Props<S>) => {
  const { schema } = props

  return (
    <div>
      {schema.fields.map((field) => {
        const { type } = field

        const key = field.key as string

        if (type === "text") {
          return <div key={key}>text</div>
        }

        if (type === "number") {
          return <div key={key}>number</div>
        }

        if (type === "select") {
          return <div key={key}>select</div>
        }

        return null
      })}
    </div>
  )
}
