import { Button } from "@radix-ui/themes"

import { PlayIcon, PlusCircledIcon, TrackNextIcon } from "@radix-ui/react-icons"

import { useStore } from "@nanostores/react"

import { $status } from "../store/status"
import { manager } from "../core"
import { addBlock } from "../canvas"
import { SetDelayButton } from "./SetDelayButton"

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

      <Button onClick={() => addBlock("pixel")} variant="soft" color="orange">
        <PlusCircledIcon />
        Pixel
      </Button>

      <Button onClick={() => addBlock("tap")} variant="soft" color="orange">
        <PlusCircledIcon />
        Tap
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

      <SetDelayButton />
    </div>
  )
}
