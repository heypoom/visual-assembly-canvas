import { Extension, keymap } from "@uiw/react-codemirror"

import { engine } from "../engine"
import { scheduler } from "../services/scheduler"
import { EditorConfig } from "../store/editor"
import { MachineProps } from "../types/blocks"
import { lineHighlighter } from "./highlight"
import { vasmLanguage } from "./syntax"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getExtensions(m: MachineProps, _config: EditorConfig) {
  const keymaps = keymap.of([
    {
      key: "Enter",
      shift: () => {
        engine.load(m.id, m.source)
        scheduler.start().then()

        return true
      },
    },
  ])

  const extensions: Extension[] = [vasmLanguage, keymaps, lineHighlighter]

  // if (config.vim) extensions.push(vim())

  return extensions
}
