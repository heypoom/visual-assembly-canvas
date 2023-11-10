import { Button } from "@radix-ui/themes"

import {
  PlayIcon,
  PlusCircledIcon,
  LapTimerIcon,
  TrackNextIcon,
} from "@radix-ui/react-icons"

import { useStore } from "@nanostores/react"

import { $status } from "../store/status"
import { manager } from "../core"
import { addBlock } from "../canvas"

export function Toolbar() {
  const status = useStore($status)

  return (
    <div className="absolute left-3 top-3 z-10 space-x-3">
      <Button
        onClick={() => addBlock("machine")}
        variant="soft"
        color="crimson"
      >
        <PlusCircledIcon />
        Machine
      </Button>

      <Button onClick={() => addBlock("pixel")} variant="soft" color="crimson">
        <PlusCircledIcon />
        Block
      </Button>

      <Button
        color="green"
        variant="soft"
        onClick={manager.run}
        className="font-semibold"
        disabled={status.running}
      >
        <PlayIcon />
        Run
      </Button>

      <Button
        color="blue"
        variant="soft"
        className="font-semibold"
        onClick={() => manager.step()}
        disabled={status.running}
      >
        <TrackNextIcon />
        Step
      </Button>

      <Button color="gray" variant="soft" className="font-semibold">
        <LapTimerIcon />
        Delay
      </Button>
    </div>
  )
}
