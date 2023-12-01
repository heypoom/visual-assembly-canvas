import { Handle, HandleType, Position } from "reactflow"
import cn from "classnames"

type Side = "left" | "right"

interface Props {
  port: number
  side: Side
  type: HandleType
  className?: string
}

const sideMap: Record<Side, Position> = {
  left: Position.Left,
  right: Position.Right,
}

export const BlockHandle = (props: Props) => {
  const position = sideMap[props.side]

  return (
    <Handle
      type={props.type}
      position={position}
      id={props.port.toString()}
      className={cn(
        "bg-crimson-9 group-hover:bg-cyan-11 hover:!bg-gray-12 hover:border-crimson-9 px-1 py-1 border-2 z-10",
        position === Position.Left && "ml-[-1px]",
        position === Position.Right && "mr-[-1px]",
        props.className,
      )}
    />
  )
}
