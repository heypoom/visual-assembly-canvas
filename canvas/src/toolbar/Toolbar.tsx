import { Button } from "@radix-ui/themes"
import { useStore } from "@nanostores/react"
import {
  ReloadIcon,
  TrackNextIcon,
  PlusCircledIcon,
} from "@radix-ui/react-icons"

import { RunButton } from "./RunButton"
import { SetDelayButton } from "./SetDelayButton"

import { $status } from "../store/status"
import { engine } from "../engine"
import { addBlock } from "../canvas"
import { $hasBlocks } from "../store/nodes"
import { addMachine } from "../canvas/utils/addBlock"
import { BlockTypes } from "../types/Node"
import { scheduler } from "../services/scheduler"
import { useAutoSave } from "../persist/useAutoSave"

function reset() {
  scheduler.pause()
  engine.reset()
}

export function Toolbar() {
  const status = useStore($status)
  const hasBlocks = useStore($hasBlocks)

  useAutoSave()

  const { halted } = status

  const types: BlockTypes[] = [
    "Pixel",
    "Tap",
    "Clock",
    "Osc",
    "Plot",
    "MidiIn",
    "MidiOut",
    "Synth",
  ]

  return (
    <div className="absolute top-3 z-10 space-x-3 flex justify-between w-full px-4">
      <div className="flex gap-x-2">
        <Button onClick={addMachine} variant="soft" color="crimson">
          <PlusCircledIcon />
          Machine
        </Button>

        {types.map((type) => (
          <Button
            key={type}
            color="orange"
            variant="soft"
            onClick={() => addBlock(type)}
          >
            <PlusCircledIcon />
            {type}
          </Button>
        ))}
      </div>

      <div className="flex gap-x-2">
        <RunButton />

        <Button
          color={halted ? "blue" : "cyan"}
          variant="soft"
          className="font-semibold"
          onClick={engine.stepOnce}
          disabled={status.running || !hasBlocks}
        >
          <TrackNextIcon />
          {halted ? "Start Over" : "Step"}
        </Button>

        <Button
          color="tomato"
          variant="soft"
          className="font-semibold"
          onClick={reset}
          disabled={!hasBlocks}
        >
          <ReloadIcon />
          Reset
        </Button>

        <SetDelayButton />
      </div>
    </div>
  )
}
