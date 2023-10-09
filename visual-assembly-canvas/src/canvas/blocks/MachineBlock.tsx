import CodeMirror from '@uiw/react-codemirror'

import {Handle, Position, NodeProps} from 'reactflow'
import {Button} from '@radix-ui/themes'
import {PlayIcon} from '@radix-ui/react-icons'
import {useStore} from '@nanostores/react'
import {useHotkeys} from 'react-hotkeys-hook'

import {Machine} from '../../types/Machine'
import {setSource} from '../../store/machines'
import {$outputs, runCode} from '../../store/results'

import {cmTheme} from '../../editor/theme'
import {vasmLanguage} from '../../editor/syntax'

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

      <div className="px-3 py-3 border rounded-2">
        <div className="flex flex-col space-y-4 text-gray-50">
          <div className="nodrag">
            <CodeMirror
              basicSetup={{lineNumbers: false, foldGutter: false}}
              theme={cmTheme}
              value={source}
              height="150"
              lang="vasm"
              onChange={(s: string) => setSource(id, s)}
              extensions={[vasmLanguage]}
            />
          </div>

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
