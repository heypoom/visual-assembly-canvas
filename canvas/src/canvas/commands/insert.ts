import { addBlock } from "../utils/addBlock"
import { useSaveState } from "../../persist/useSaveState"
import { STORAGE_KEY } from "../../persist/localStorage"
import { useMemo } from "react"
import { BlockTypes } from "../../types/Node"
import { defaultProps } from "../../blocks"

interface Options {
  position?: { x: number; y: number }
}

interface Context {
  clearAll: () => void
}

const blocks = Object.keys(defaultProps) as BlockTypes[]

const createInsertCommand =
  (context: Context) =>
  (command: string, options?: Options): boolean => {
    command = command.replace(/^\//, "").toLowerCase()

    const block = blocks.find((b) => b.toLowerCase() === command)
    if (block) {
      addBlock(block, options)
      return true
    }

    if (command === "clear_all") {
      context.clearAll()
      localStorage.removeItem(STORAGE_KEY)
      return true
    }

    return false
  }

export function useInsertCommand() {
  const { clear } = useSaveState()

  const insertCommand = useMemo(() => {
    return createInsertCommand({ clearAll: clear })
  }, [])

  return { insertCommand }
}
