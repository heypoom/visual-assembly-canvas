import CodeMirror from '@uiw/react-codemirror'
import {dracula} from '@uiw/codemirror-theme-dracula'

import {Handle, Position, NodeProps} from 'reactflow'
import {Button} from '@radix-ui/themes'
import {useStore} from '@nanostores/react'
import {useHotkeys} from 'react-hotkeys-hook'

import {Machine} from '../../types/Machine'
import {setSource} from '../../store/machines'
import {$outputs, runCode} from '../../store/results'

export function MachineBlock(props: NodeProps<Machine>) {
  const {id, data} = props
  const {source} = data

  const outputs = useStore($outputs)
  const run = () => runCode(id, source)

  const rawOut = outputs[id]
  const out = rawOut ? [...rawOut].map((x) => x) : null

  useHotkeys('shift+enter', run)

  return (
    <div className="font-mono">
      <Handle type="source" position={Position.Left} id="ls" />

      <div className="px-4 py-4 bg-stone-900 border border-gray-100 rounded-sm shadow-sm">
        <div className="flex flex-col space-y-4 text-gray-50">
          <CodeMirror
            basicSetup={{lineNumbers: false, foldGutter: false}}
            theme={dracula}
            value={source}
            height="150"
            onChange={(s: string) => setSource(id, s)}
          />

          {out && (
            <div className="flex">
              {out.map((u, i) => (
                <div className="rounded-sm px-1 bg-stone-800 mx-1" key={i}>
                  {u}
                </div>
              ))}
            </div>
          )}

          <Button color="crimson" onClick={run}>
            Run
          </Button>
        </div>
      </div>

      <Handle type="target" position={Position.Right} id="rt" />
    </div>
  )
}
