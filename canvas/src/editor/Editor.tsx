import { useStore } from "@nanostores/react"
import CodeMirror, { EditorView } from "@uiw/react-codemirror"
import { useCallback, useMemo } from "react"

import { engine } from "../engine"
import { setSource } from "../store/blocks"
import { $editorConfig } from "../store/editor"
import { MachineProps } from "../types/blocks"
import { getExtensions } from "./extensions"
import { addLineHighlight } from "./highlight"
import { cmTheme } from "./theme"

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
      engine.highlighters.set(id, (lineNo) => {
        const pos = view.state.doc.line(lineNo).from
        view.dispatch({ effects: addLineHighlight.of(pos) })
      })
    },
    [id],
  )

  return (
    <CodeMirror
      onBlur={() => engine.load(id, source, { invalidate: false })}
      basicSetup={{ lineNumbers: false, foldGutter: false }}
      maxHeight="1200px"
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
