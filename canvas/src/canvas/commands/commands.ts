import { addBlock } from "../utils/addBlock"
import { useSaveState } from "../../persist/useSaveState"
import { STORAGE_KEY } from "../../persist/localStorage"
import { useMemo } from "react"
import { BlockTypes } from "../../types/Node"
import { defaultProps } from "../../blocks"
import { scheduler } from "../../services/scheduler"
import { $status } from "../../store/status"

interface Options {
  position?: { x: number; y: number }
}

interface Context {
  clearAll: () => void
}

interface Command {
  name: string
  prefix: string
  description?: string
  action?: CommandAction
}

const commands: Command[] = [
  {
    name: "Clear All",
    prefix: "clear_all",
  },
  {
    name: "Run",
    prefix: "run",
  },
]

const blocks = Object.keys(defaultProps) as BlockTypes[]

type CommandAction = { type: "add_block"; block: BlockTypes }

blocks.forEach((block) => {
  commands.push({
    name: `Add ${block}`,
    description: `Add the ${block} block`,
    prefix: block.toLowerCase(),
    action: { type: "add_block", block },
  })
})

export const getMatchedCommands = (input: string): Command[] => {
  input = input.replace(/^\//, "").toLowerCase()

  const matches: Command[] = []

  for (const command of commands) {
    if (command.prefix.startsWith(input)) {
      matches.push(command)
    }
  }

  return matches
}

const createCommandRunner =
  (context: Context) =>
  (command: Command, options?: Options): boolean => {
    if (command.action?.type === "add_block") {
      addBlock(command.action.block, options)
      return true
    }

    if (command.prefix === "clear_all") {
      context.clearAll()
      localStorage.removeItem(STORAGE_KEY)
      return true
    }

    if (command.prefix === "run") {
      const running = $status.get().running

      if (running) {
        scheduler.pause()
      } else {
        scheduler.start().then()
      }

      return true
    }

    return false
  }

export function useCommandRunner() {
  const { clear } = useSaveState()

  const run = useMemo(() => {
    return createCommandRunner({ clearAll: clear })
  }, [])

  return { run }
}
