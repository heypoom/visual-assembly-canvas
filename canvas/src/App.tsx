import {Canvas} from "./canvas/Canvas"
import {Toolbar} from "./toolbar/Toolbar"

function App() {
  return (
    <div className="relative bg-stone">
      <Toolbar />
      <Canvas />
    </div>
  )
}

export default App
