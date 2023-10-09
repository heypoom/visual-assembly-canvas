import {Button} from '@radix-ui/themes'

import {Canvas} from './canvas/Canvas'
import {addMachine} from './store/machines'

function App() {
  return (
    <div className="relative">
      <div className="">
        <Button onClick={() => addMachine()}>Add Machine</Button>
      </div>

      <Canvas />
    </div>
  )
}

export default App
