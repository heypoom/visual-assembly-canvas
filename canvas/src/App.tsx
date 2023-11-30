import { ReactFlowProvider } from "reactflow"

import { Canvas } from "./canvas/Canvas"
import { Toolbar } from "./toolbar/Toolbar"
import { SlashCommand } from "./canvas/components/SlashCommand"

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
