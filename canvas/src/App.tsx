import { ReactFlowProvider } from "reactflow"

import { Canvas } from "./canvas/Canvas"
import { Toolbar } from "./toolbar/Toolbar"
import { Insert } from "./canvas/components/Insert"

function App() {
  return (
    <ReactFlowProvider>
      <div className="relative bg-stone">
        <Toolbar />
        <Canvas />
        <Insert />
      </div>
    </ReactFlowProvider>
  )
}

export default App
