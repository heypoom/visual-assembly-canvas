import CodeMirror from "@uiw/react-codemirror"

import { Handle, Position, NodeProps } from "reactflow"

import { useStore } from "@nanostores/react"
import { Extension } from "@uiw/react-codemirror"
import { vim } from "@replit/codemirror-vim"
import { keymap } from "@codemirror/view"

import { Machine } from "../../types/Machine"
import { setSource, manager } from "../../machine/index.ts"

import { cmTheme } from "../../editor/theme"
import { vasmLanguage } from "../../editor/syntax"
import { $editorConfig, EditorConfig } from "../../store/editor.ts"
import { useMemo } from "react"
import { $output } from "../../store/results.ts"
import { MachineError } from "../../types/MachineState.ts"

function getExtensions(m: Machine, config: EditorConfig) {
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

  const extensions: Extension[] = [vasmLanguage, keymaps]

  if (config.vim) extensions.push(vim())

  return extensions
}

const ErrorIndicator = ({ error }: { error: MachineError }) => {
  if ("ExecutionCycleExceeded" in error) {
    return <pre>Execution cycle exceeded.</pre>
  }

  if ("HangingAwaits" in error) {
    return <pre>Machine is expecting a message which never arrives.</pre>
  }

  if ("ExecutionFailed" in error) {
    return (
      <pre>
        Your program produced an error:{" "}
        {JSON.stringify(error.ExecutionFailed.error, null, 2)}
      </pre>
    )
  }

  if ("CannotParse" in error) {
    return (
      <pre>
        Syntax is incorrect: {JSON.stringify(error.CannotParse.error, null, 2)}
      </pre>
    )
  }

  return <pre>{JSON.stringify(error, null, 2)}</pre>
}

export function MachineBlock(props: NodeProps<Machine>) {
  const { data } = props
  const { source } = data

  const outputs = useStore($output)

  const state = outputs[data.id] ?? {}
  const stack = state.stack ? [...state.stack].map((x) => x) : null

  const config = useStore($editorConfig)
  const extensions = useMemo(() => getExtensions(data, config), [data, config])

  return (
    <div className="font-mono bg-slate-1">
      <Handle type="source" position={Position.Left} id="ls" />

      <div className="px-3 py-3 border rounded-2">
        <div className="flex flex-col space-y-2 text-gray-50">
          <div className="min-h-[100px]">
            <div className="nodrag">
              <CodeMirror
                onBlur={() => manager.load(data.id, data.source)}
                basicSetup={{ lineNumbers: false, foldGutter: false }}
                width="300px"
                maxHeight="400px"
                minWidth="300px"
                maxWidth="600px"
                theme={cmTheme}
                value={source}
                lang="vasm"
                onChange={(s: string) => setSource(data.id, s)}
                extensions={extensions}
              />
            </div>
          </div>

          {state.error && (
            <div className="text-1 text-orange-11">
              <ErrorIndicator error={state.error} />
            </div>
          )}

          {state.logs?.length ? (
            <div className="text-cyan-11 text-1 font-medium rounded-sm px-1 bg-stone-800 mx-1">
              {state.logs.map((log, i) => (
                <div key={i}>&gt; {log}</div>
              ))}
            </div>
          ) : null}

          {stack && (
            <div className="flex">
              {stack.map((u, i) => (
                <div
                  className="text-1 text-crimson-11 rounded-sm px-1 bg-stone-800 mx-1"
                  key={i}
                >
                  {u}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Handle type="target" position={Position.Right} id="rt" />
    </div>
  )
}
