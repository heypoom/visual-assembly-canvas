import {Button, Container} from '@radix-ui/themes'

import {Canvas} from './canvas/Canvas'

function App() {
  return (
    <div className="min-h-screen">
      <Canvas />
      <Button>Import</Button>
    </div>
  )
}

export default App
