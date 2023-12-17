import { BaseBlockFieldOf, BlockTypes } from "@/types/Node"

export type BlockKeys<T extends BlockTypes> = keyof BaseBlockFieldOf<T>

type BlockValue<
  T extends BlockTypes,
  K extends BlockKeys<T>,
  F = BaseBlockFieldOf<T>[K],
> = F extends string ? F : F extends { type: infer FT } ? FT : never

type TextField = { type: "text" }
type NumberField = { type: "number"; min?: number; max?: number }

type SelectField<T extends BlockTypes, K extends BlockKeys<T>> = {
  type: "select"
  options: { key: BlockValue<T, K>; title: string }[]
}

export type Field<T extends BlockTypes, K extends BlockKeys<T>> = {
  key: K
} & (TextField | NumberField | SelectField<T, K>)

export type SchemaOf<T extends BlockTypes, F extends Field<T, BlockKeys<T>>> = {
  type: T
  fields: F[]
}

export const createSchema = <
  T extends BlockTypes,
  F extends Field<T, BlockKeys<T>>,
>(
  schema: SchemaOf<T, F>,
) => schema
