import * as wasm from 'machine-wasm'

const app = wasm.initSync({})

app.greet()

function App() {
  return <div>22</div>
}

export default App
