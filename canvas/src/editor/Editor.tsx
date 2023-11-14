import { useCallback, useMemo } from "react"
import { useStore } from "@nanostores/react"
import CodeMirror, { EditorView } from "@uiw/react-codemirror"

import { cmTheme } from "./theme"
import { getExtensions } from "./extensions"
import { addLineHighlight } from "./highlight"

import { setSource, manager } from "../core"
import { $editorConfig } from "../store/editor"

import { MachineProps } from "../types/blocks"

type Props = MachineProps

export function MachineEditor(props: Props) {
  const { id, source } = props

  const config = useStore($editorConfig)

  const extensions = useMemo(
    () => getExtensions(props, config),
    [props, config],
  )

  const onCreate = useCallback(
    (view: EditorView) => {
      manager.highlighters.set(id, (lineNo) => {
        const pos = view.state.doc.line(lineNo).from
        view.dispatch({ effects: addLineHighlight.of(pos) })
      })
    },
    [id],
  )

  return (
    <CodeMirror
      onBlur={() => manager.load(id, source)}
      basicSetup={{ lineNumbers: false, foldGutter: false }}
      maxHeight="400px"
      minWidth="300px"
      maxWidth="600px"
      theme={cmTheme}
      value={source}
      lang="vasm"
      onChange={(s: string) => setSource(id, s)}
      extensions={extensions}
      onCreateEditor={onCreate}
    />
  )
}
