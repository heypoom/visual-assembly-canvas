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
import { manager } from "../core"
import { addBlock } from "../canvas"
import { $hasBlocks } from "../store/nodes"
import { addMachine } from "../canvas/utils/addBlock"
import { BlockTypes } from "../types/Node"

export function Toolbar() {
  const status = useStore($status)
  const hasBlocks = useStore($hasBlocks)

  const { halted } = status

  const types: BlockTypes[] = [
    "Pixel",
    "Tap",
    "Osc",
    "Plot",
    "MidiIn",
    "MidiOut",
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
          onClick={() => manager.step()}
          disabled={status.running || !hasBlocks}
        >
          <TrackNextIcon />
          {halted ? "Start Over" : "Step"}
        </Button>

        <Button
          color="tomato"
          variant="soft"
          className="font-semibold"
          onClick={() => manager.reset()}
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
