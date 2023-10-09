import {Button} from '@radix-ui/themes'
import {PlusCircledIcon} from '@radix-ui/react-icons'

import {Canvas} from './canvas/Canvas'
import {addMachine} from './store/machines'

function App() {
  return (
    <div className="relative bg-stone">
      <div className="absolute left-2 top-2 z-10">
        <Button onClick={addMachine} variant="soft" color="crimson">
          <PlusCircledIcon />
          Machine
        </Button>
      </div>

      <Canvas />
    </div>
  )
}

export default App
