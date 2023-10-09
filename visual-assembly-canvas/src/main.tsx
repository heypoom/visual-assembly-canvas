import React from "react"
import ReactDOM from "react-dom/client"
import setup, { setup_system } from "machine-wasm"
import { Theme } from "@radix-ui/themes"

import App from "./App.tsx"

import "./styles/index.css"

import "@radix-ui/themes/styles.css"

const root = document.getElementById("root")!

await setup()
setup_system()

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <Theme appearance="dark">
      <App />
    </Theme>
  </React.StrictMode>,
)
