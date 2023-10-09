import { map } from "nanostores"

export const $outputs = map<Record<string, Uint16Array | null>>({})
export const $errors = map<Record<string, Error | null>>({})
