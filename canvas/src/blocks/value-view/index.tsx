import { BlockPropsOf } from "@/types/Node"

type Props = BlockPropsOf<"ValueView">

export const ValueViewBlock = (props: Props) => {
  const { id, target, offset, size, visual, values } = props.data

  return <div>Visualizer: {JSON.stringify(props.data)}</div>
}
