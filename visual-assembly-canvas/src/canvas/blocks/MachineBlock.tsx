import {Node, Handle, Position, NodeProps} from 'reactflow'

type MachineNodeData = {
  label: string
}

export function MachineBlock(props: NodeProps<MachineNodeData>) {
  return (
    <div>
      <Handle type="target" position={Position.Top} />

      <div className="bg-teal-400 px-4 py-2 rounded-full hover:bg-teal-500">
        <div>id: {props.data.label}</div>
      </div>

      <Handle type="source" position={Position.Bottom} id="a" />

      <Handle type="source" position={Position.Bottom} id="b" />
    </div>
  )
}
