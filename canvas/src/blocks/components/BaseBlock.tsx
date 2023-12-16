import cn from "classnames"
import { CSSProperties, ReactNode, useReducer } from "react"
import { NodeProps } from "reactflow"

import { BlockHandle } from "@/blocks/components/BlockHandle"
import { RightClickMenu } from "@/blocks/components/RightClickMenu"

interface BaseBlockProps {
  node: NodeProps
  className?: string
  sources?: number
  targets?: number
  children?: ReactNode
  settings?: () => ReactNode
  style?: CSSProperties
  onReset?: () => void
}

export const BaseBlock = (props: BaseBlockProps) => {
  const {
    node,
    className,
    sources = 0,
    targets = 0,
    settings: Settings,
    children,
  } = props

  const [showSettings, toggleSettings] = useReducer((n) => !n, false)

  const isSource = sources > 0 && targets === 0
  const isSink = targets > 0 && sources === 0

  const handleClassName = cn(
    isSink && "!bg-cyan-9",
    isSource && "!bg-crimson-9",
  )

  return (
    <div className="group">
      {[...Array(targets)].map((_, i) => (
        <BlockHandle
          key={i}
          port={sources + i}
          side="left"
          type="target"
          style={{ marginTop: `${getTop(i, targets)}px` }}
          className={handleClassName}
        />
      ))}

      <RightClickMenu
        id={node.data.id}
        show={showSettings}
        toggle={toggleSettings}
      >
        <div
          style={props.style}
          className={cn(
            "flex flex-col relative gap-y-2",
            "border-2 rounded-2 group-hover:border-gray-11",
            isSource && "border-crimson-9",
            isSink && "border-cyan-9",
            node.selected && "!border-yellow-11",
            className,
          )}
        >
          {children}
          {showSettings && Settings && Settings()}
        </div>
      </RightClickMenu>

      {[...Array(sources)].map((_, i) => (
        <BlockHandle
          key={i}
          port={i}
          side="right"
          type="source"
          style={{ marginTop: `${getTop(i, sources)}px` }}
          className={handleClassName}
        />
      ))}
    </div>
  )
}

function getTop(index: number, total: number) {
  const width = total % 2 === 0 ? 40 : 60

  // even number of ports
  if (total % 2 === 0) {
    const middleIndex = total / 2

    const distanceFromMiddle =
      index < middleIndex ? index - middleIndex : index - middleIndex + 1

    return distanceFromMiddle * (width / 2)
  }

  const middleIndex = Math.floor(total / 2)
  const distanceFromMiddle = index - middleIndex

  // odd
  return distanceFromMiddle * (width / 2)
}
