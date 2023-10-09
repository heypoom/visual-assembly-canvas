import {Handle, Position, NodeProps} from 'reactflow'
import {TextArea} from '@radix-ui/themes'

import {Machine} from '../../types/Machine'
import {useState} from 'react'
import {setSource} from '../../store/machines'

export function MachineBlock(props: NodeProps<Machine>) {
  const {id, data} = props

  return (
    <div className="font-mono">
      <Handle type="target" position={Position.Top} />

      <div className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-sm">
        <div className="nodrag">
          <TextArea
            value={data.source}
            onChange={(e) => setSource(id, e.target.value)}
            className="bg-gray-50 border-none"
          />
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} id="a" />

      <Handle type="source" position={Position.Bottom} id="b" />
    </div>
  )
}
