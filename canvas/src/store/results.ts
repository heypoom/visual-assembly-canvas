import { map } from "nanostores"

import { MachineError, MachineStates } from "../types/MachineState"

export const $output = map<MachineStates>({})

export function setError(id: number, error: MachineError) {
  const output = $output.get()

  $output.setKey(id, { ...output[id], error })
  console.log(`error of ${id} set to`, error)
}
