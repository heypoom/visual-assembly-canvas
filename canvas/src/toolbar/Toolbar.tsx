import { Button } from "@radix-ui/themes"

import {
  PauseIcon,
  PlayIcon,
  PlusCircledIcon,
  StopIcon,
  TrackNextIcon,
} from "@radix-ui/react-icons"

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

      <Button onClick={() => addBlock("osc")} variant="soft" color="orange">
        <PlusCircledIcon />
        Osc
      </Button>

      <Button onClick={() => addBlock("plotter")} variant="soft" color="orange">
        <PlusCircledIcon />
        Plot
      </Button>

      {status.running ? (
        <Button
          color="tomato"
          variant="soft"
          onClick={() => (manager.pause = true)}
          className="font-semibold"
        >
          <PauseIcon />
          Pause
        </Button>
      ) : (
        <Button
          color="green"
          variant="soft"
          onClick={manager.run}
          className="font-semibold"
        >
          <PlayIcon />
          Run
        </Button>
      )}

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

      <Button
        color="tomato"
        variant="soft"
        className="font-semibold"
        onClick={() => manager.reset()}
      >
        Reset
      </Button>

      <SetDelayButton />
    </div>
  )
}
