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

export function Toolbar() {
  const status = useStore($status)
  const hasBlocks = useStore($hasBlocks)

  const { halted } = status

  return (
    <div className="absolute top-3 z-10 space-x-3 flex justify-between w-full px-4">
      <div className="flex gap-x-2">
        <Button onClick={addMachine} variant="soft" color="crimson">
          <PlusCircledIcon />
          Machine
        </Button>

        <Button onClick={() => addBlock("Pixel")} variant="soft" color="orange">
          <PlusCircledIcon />
          Pixel
        </Button>

        <Button onClick={() => addBlock("Tap")} variant="soft" color="orange">
          <PlusCircledIcon />
          Tap
        </Button>

        <Button onClick={() => addBlock("Osc")} variant="soft" color="orange">
          <PlusCircledIcon />
          Osc
        </Button>

        <Button onClick={() => addBlock("Plot")} variant="soft" color="orange">
          <PlusCircledIcon />
          Plot
        </Button>
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
