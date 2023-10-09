import { map } from "nanostores"
import { load_machine } from "machine-wasm"

export const $outputs = map<Record<string, Uint16Array | null>>({})
export const $errors = map<Record<string, Error | null>>({})

export function runCode(id: string, source: string) {
  try {
    const out = load_machine(source)
    $outputs.setKey(id, out)
    $errors.setKey(id, null)
  } catch (err) {
    if (err instanceof Error) {
      $outputs.setKey(id, null)
      $errors.setKey(id, err)
    }
  }
}
