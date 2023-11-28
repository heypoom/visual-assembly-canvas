import { Extension, keymap } from "@uiw/react-codemirror"

import { vasmLanguage } from "./syntax"

import { MachineProps } from "../types/blocks"
import { manager } from "../core"
import { EditorConfig } from "../store/editor"
import { lineHighlighter } from "./highlight"
import { scheduler } from "../services/scheduler"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getExtensions(m: MachineProps, _config: EditorConfig) {
  const keymaps = keymap.of([
    {
      key: "Enter",
      shift: () => {
        manager.load(m.id, m.source)
        scheduler.start().then()

        return true
      },
    },
  ])

  const extensions: Extension[] = [vasmLanguage, keymaps, lineHighlighter]

  // if (config.vim) extensions.push(vim())

  return extensions
}
