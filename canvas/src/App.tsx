import { ReactFlowProvider } from "reactflow"

import { Canvas } from "./canvas/Canvas"
import { SlashCommand } from "./canvas/components/SlashCommand"
import { Toolbar } from "./toolbar/Toolbar"

function App() {
  return (
    <ReactFlowProvider>
      <div className="relative bg-stone">
        <Toolbar />
        <Canvas />
        <SlashCommand />
      </div>
    </ReactFlowProvider>
  )
}

export default App
