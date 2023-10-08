import setup, {load_machine} from 'machine-wasm'

await setup()

// @ts-ignore
window.load_machine = load_machine

function App() {
  return <div>22</div>
}

export default App
