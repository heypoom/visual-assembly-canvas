import setup, {greet} from 'machine-wasm'

await setup()
greet()

function App() {
  return <div>22</div>
}

export default App
