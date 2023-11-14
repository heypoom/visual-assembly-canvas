import React from "react"
import ReactDOM from "react-dom/client"

import { Theme } from "@radix-ui/themes"

import App from "./App"

import "./store/logger"
import "./styles/index.css"

import "@radix-ui/themes/styles.css"

const root = document.getElementById("root")!

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <Theme appearance="dark">
      <App />
    </Theme>
  </React.StrictMode>,
)
