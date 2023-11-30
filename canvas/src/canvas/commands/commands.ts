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
import { $clock } from "../../store/clock"

interface Options {
  position?: { x: number; y: number }
  input?: string
}

interface Context {
  clearAll: () => void
}

interface Command {
  name: string
  prefix: string
  action?: CommandAction
  destructive?: boolean
  args?: CommandArg[]
  hint?: () => string
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

interface CommandArg {
  type?: "number" | "string"
}

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
    name: "Machine Speed (ops/tick)",
    prefix: "machine_speed",
    args: [{ type: "number" }],
    hint: () => `${$clock.get().instructionsPerTick} ops/tick`,
  },
  {
    name: "Canvas Speed (ops/tick)",
    prefix: "canvas_speed",
    args: [{ type: "number" }],
    hint: () => `${$clock.get().canvasBatchedTicks} ops/tick`,
  },
  {
    name: "Canvas Delay (ms)",
    prefix: "canvas_delay",
    args: [{ type: "number" }],
    hint: () => `${$clock.get().canvasMs}ms`,
  },
  {
    name: "Side Effect Delay (ms)",
    prefix: "effect_delay",
    args: [{ type: "number" }],
    hint: () => `${$clock.get().effectMs}ms`,
  },
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

export const isArgsValid = (input: string, command: Command): boolean => {
  if (!command) return false
  if (!command.args) return true

  const args = input.split(" ").slice(1)
  if (args.length < command.args.length) return false

  for (const [i, str] of args.entries()) {
    if (!str) return false

    const schema = command.args[i]

    if (schema.type === "number") {
      if (isNaN(Number(str))) return false
    }
  }

  return true
}

export const getMatchedCommands = (input: string): Command[] => {
  input = input.replace(/^\//, "").toLowerCase()

  const [query] = input.split(" ")

  const matches: Command[] = []
  const found: Record<string, boolean> = {}

  // Pass 1: match by prefix
  for (const command of commands) {
    if (command.prefix.startsWith(query)) {
      found[command.prefix] = true
      matches.push(command)
    }
  }

  // Pass 2: match by name
  for (const command of commands) {
    if (found[command.prefix]) continue

    if (command.name.toLowerCase().includes(query)) {
      matches.push(command)
    }
  }

  return matches
}

interface ActionContext {
  args: string[]
}

type Fn = (context: ActionContext) => void

const createCommandRunner = (context: Context) => {
  const actions: Record<string, Fn> = {
    reset: () => engine.reset(),

    step(ctx) {
      let count = Number(ctx.args[0])
      if (isNaN(count)) count = 1

      engine.stepSlow(count)
    },

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

    machine_speed(ctx) {
      const ops = Number(ctx.args[0])

      engine.setInstructionsPerTick(ops)
    },

    canvas_speed(ctx) {
      const ops = Number(ctx.args[0])

      engine.setCanvasBatchedTicks(ops)
    },

    canvas_delay(ctx) {
      const delay = Number(ctx.args[0])

      $clock.setKey("canvasMs", delay)
      scheduler.restart()
    },

    effect_delay(ctx) {
      const delay = Number(ctx.args[0])

      $clock.setKey("effectMs", delay)
      scheduler.restart()
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

    const args = options?.input?.split(" ").slice(1) ?? []
    action({ args })

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
