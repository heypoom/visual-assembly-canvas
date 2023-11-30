import { ReactFlowProvider } from "reactflow"

import { Canvas } from "./canvas/Canvas"
import { Toolbar } from "./toolbar/Toolbar"

function App() {
  return (
    <ReactFlowProvider>
      <div className="relative bg-stone">
        <Toolbar />
        <Canvas />
      </div>
    </ReactFlowProvider>
  )
}

export default App
