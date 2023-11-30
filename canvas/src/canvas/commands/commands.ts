import { addBlock } from "../utils/addBlock"
import { useSaveState } from "../../persist/useSaveState"
import { STORAGE_KEY } from "../../persist/localStorage"
import { useMemo } from "react"
import { BlockTypes } from "../../types/Node"
import { defaultProps } from "../../blocks"
import { scheduler } from "../../services/scheduler"
import { $status } from "../../store/status"
import { engine } from "../../engine"
import { profiler } from "../../services/scheduler/profiler"

interface Options {
  position?: { x: number; y: number }
}

interface Context {
  clearAll: () => void
}

interface Command {
  name: string
  prefix: string
  action?: CommandAction
  destructive?: boolean
}

const commands: Command[] = [
  {
    name: "Run / Pause",
    prefix: "run",
  },
  {
    name: "Step",
    prefix: "step",
  },
  {
    name: "Reset",
    prefix: "reset",
  },
]

const blocks = Object.keys(defaultProps) as BlockTypes[]

type CommandAction = { type: "add_block"; block: BlockTypes }

blocks.forEach((block) => {
  commands.push({
    name: `Add ${block}`,
    prefix: block.toLowerCase(),
    action: { type: "add_block", block },
  })
})

commands.push(
  {
    name: "Clear All",
    prefix: "clear_all",
    destructive: true,
  },
  {
    name: "Toggle Profiler",
    prefix: "profiler",
  },
)

export const getMatchedCommands = (input: string): Command[] => {
  input = input.replace(/^\//, "").toLowerCase()

  const matches: Command[] = []
  const found: Record<string, boolean> = {}

  // Pass 1: match by prefix
  for (const command of commands) {
    if (command.prefix.startsWith(input)) {
      found[command.prefix] = true
      matches.push(command)
    }
  }

  // Pass 2: match by name
  for (const command of commands) {
    if (found[command.prefix]) continue

    if (command.name.toLowerCase().includes(input)) {
      matches.push(command)
    }
  }

  return matches
}

const createCommandRunner = (context: Context) => {
  const actions: Record<string, () => void> = {
    reset: () => engine.reset(),
    step: () => engine.stepOnce(),

    clear_all() {
      context.clearAll()
      localStorage.removeItem(STORAGE_KEY)
    },

    run() {
      const running = $status.get().running

      if (running) {
        scheduler.pause()
      } else {
        scheduler.start().then()
      }
    },

    profiler() {
      profiler.toggle()
    },
  }

  return (command: Command, options?: Options): boolean => {
    if (command.action?.type === "add_block") {
      addBlock(command.action.block, options)
      return true
    }

    // Match by prefix
    const action = actions[command.prefix]
    if (!action) return false

    action()
    return true
  }
}

export function useCommandRunner() {
  const { clear } = useSaveState()

  const run = useMemo(() => {
    return createCommandRunner({ clearAll: clear })
  }, [])

  return { run }
}
