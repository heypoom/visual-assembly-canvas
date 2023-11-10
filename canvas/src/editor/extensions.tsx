import { Extension, keymap } from "@uiw/react-codemirror"

import { vasmLanguage } from "./syntax"

import { MachineBlock } from "../types/blocks"
import { manager } from "../core/index"
import { EditorConfig } from "../store/editor"
import { lineHighlighter } from "./highlight"

export function getExtensions(m: MachineBlock, _config: EditorConfig) {
  const keymaps = keymap.of([
    {
      key: "Enter",
      shift: () => {
        manager.load(m.id, m.source)
        manager.run()

        return true
      },
    },
  ])

  const extensions: Extension[] = [vasmLanguage, keymaps, lineHighlighter]

  // if (config.vim) extensions.push(vim())

  return extensions
}
