import { Button } from "@radix-ui/themes"
import { PlayIcon, PlusCircledIcon, LapTimerIcon } from "@radix-ui/react-icons"

import { Canvas } from "./canvas/Canvas"
import { addMachine, manager } from "./machine"

function App() {
  return (
    <div className="relative bg-stone">
      <div className="absolute left-3 top-3 z-10 space-x-3">
        <Button onClick={addMachine} variant="soft" color="crimson">
          <PlusCircledIcon />
          New
        </Button>

        <Button
          color="green"
          variant="soft"
          onClick={manager.run}
          className="font-semibold"
        >
          <PlayIcon />
          Run
        </Button>

        <Button
          color="blue"
          variant="soft"
          className="font-semibold"
          onClick={() => manager.step()}
        >
          <LapTimerIcon />
          Step
        </Button>
      </div>

      <Canvas />
    </div>
  )
}

export default App
