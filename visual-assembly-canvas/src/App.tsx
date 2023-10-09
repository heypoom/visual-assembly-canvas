import {Button} from '@radix-ui/themes'

import {Canvas} from './canvas/Canvas'
import {addMachine} from './store/machines'

function App() {
  return (
    <div className="relative bg-stone-900">
      <div className="absolute left-2 top-2 z-10">
        <Button onClick={addMachine}>Add Machine</Button>
      </div>

      <Canvas />
    </div>
  )
}

export default App
