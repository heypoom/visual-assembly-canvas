import {map} from 'nanostores'
import {load_machine} from 'machine-wasm'

export const $outputs = map<Record<string, Uint16Array>>({})

export function runCode(id: string, source: string) {
  try {
    const out = load_machine(source)

    $outputs.setKey(id, out)
  } catch (err) {
    console.log('wasm error:', err)
  }
}
