import { Button } from "@radix-ui/themes"
import { useStore } from "@nanostores/react"
import { TrackNextIcon, PlusCircledIcon } from "@radix-ui/react-icons"

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

  return (
    <div className="absolute left-3 top-3 z-10 space-x-3">
      <Button onClick={addMachine} variant="soft" color="crimson">
        <PlusCircledIcon />
        Machine
      </Button>

      <Button
        onClick={() => addBlock("PixelBlock")}
        variant="soft"
        color="orange"
      >
        <PlusCircledIcon />
        Pixel
      </Button>

      <Button
        onClick={() => addBlock("TapBlock")}
        variant="soft"
        color="orange"
      >
        <PlusCircledIcon />
        Tap
      </Button>

      <Button
        onClick={() => addBlock("OscBlock")}
        variant="soft"
        color="orange"
      >
        <PlusCircledIcon />
        Osc
      </Button>

      <Button
        onClick={() => addBlock("PlotterBlock")}
        variant="soft"
        color="orange"
      >
        <PlusCircledIcon />
        Plot
      </Button>

      <RunButton />

      <Button
        color="blue"
        variant="soft"
        className="font-semibold"
        onClick={() => manager.step()}
        disabled={status.running || !hasBlocks}
      >
        <TrackNextIcon />
        Step
      </Button>

      <Button
        color="tomato"
        variant="soft"
        className="font-semibold"
        onClick={() => manager.reset()}
        disabled={!hasBlocks}
      >
        Reset
      </Button>

      <SetDelayButton />
    </div>
  )
}
