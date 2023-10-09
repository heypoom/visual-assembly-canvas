import CodeMirror from "@uiw/react-codemirror"

import { Handle, Position, NodeProps } from "reactflow"
import { Button } from "@radix-ui/themes"
import { PlayIcon } from "@radix-ui/react-icons"
import { useStore } from "@nanostores/react"
import { Extension } from "@uiw/react-codemirror"
import { vim } from "@replit/codemirror-vim"
import { keymap } from "@codemirror/view"

import { Machine } from "../../types/Machine"
import { setSource } from "../../store/machines"
import { $errors, $outputs, runCode } from "../../store/results"

import { cmTheme } from "../../editor/theme"
import { vasmLanguage } from "../../editor/syntax"
import { $editorConfig, EditorConfig } from "../../store/editor.ts"
import { useMemo } from "react"

function getExtensions(m: Machine, config: EditorConfig) {
  const keymaps = keymap.of([
    {
      key: "Enter",
      shift: () => {
        runCode(m.id, m.source)
        return true
      },
    },
  ])

  const extensions: Extension[] = [vasmLanguage, keymaps]

  if (config.vim) extensions.push(vim())

  return extensions
}

export function MachineBlock(props: NodeProps<Machine>) {
  const { id, data } = props
  const { source } = data

  const outputs = useStore($outputs)
  const errors = useStore($errors)

  const run = () => runCode(id, source)

  const error = errors[id]
  const rawOut = outputs[id]
  const out = rawOut ? [...rawOut].map((x) => x) : null

  const config = useStore($editorConfig)
  const extensions = useMemo(() => getExtensions(data, config), [data, config])

  return (
    <div className="font-mono bg-slate-1">
      <Handle type="source" position={Position.Left} id="ls" />

      <div className="px-3 py-3 border rounded-2">
        <div className="flex flex-col space-y-2 text-gray-50">
          <div className="nodrag">
            <CodeMirror
              basicSetup={{ lineNumbers: false, foldGutter: false }}
              width="300px"
              minWidth="300px"
              minHeight="150px"
              maxWidth="600px"
              theme={cmTheme}
              value={source}
              lang="vasm"
              onChange={(s: string) => setSource(id, s)}
              extensions={extensions}
            />
          </div>

          {error && (
            <div>
              <div className="text-1 text-orange-11">
                <pre>{error.name}</pre>
              </div>
            </div>
          )}

          {out && (
            <div className="flex">
              {out.map((u, i) => (
                <div className="rounded-sm px-1 bg-stone-800 mx-1" key={i}>
                  {u}
                </div>
              ))}
            </div>
          )}

          <Button
            color="crimson"
            variant="soft"
            onClick={run}
            className="font-semibold"
          >
            <PlayIcon />
            Run
          </Button>
        </div>
      </div>

      <Handle type="target" position={Position.Right} id="rt" />
    </div>
  )
}
