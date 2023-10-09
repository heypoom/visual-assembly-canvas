import { Button } from "@radix-ui/themes"
import { PlayIcon, PlusCircledIcon } from "@radix-ui/react-icons"

import { Canvas } from "./canvas/Canvas"
import { addMachine, runAll } from "./store/machines"

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
          onClick={runAll}
          className="font-semibold"
        >
          <PlayIcon />
          Run
        </Button>
      </div>

      <Canvas />
    </div>
  )
}

export default App
