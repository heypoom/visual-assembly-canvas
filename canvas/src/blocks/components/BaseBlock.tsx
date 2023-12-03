import cn from "classnames"
import { ReactNode, useReducer } from "react"
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

  return (
    <div className="group">
      {[...Array(targets)].map((_, i) => (
        <BlockHandle key={i} port={sources + i} side="left" type="target" />
      ))}

      <RightClickMenu
        id={node.data.id}
        show={showSettings}
        toggle={toggleSettings}
      >
        <div
          className={cn(
            "flex flex-col relative gap-y-2",
            "border-2 rounded-2",
            isSource && "border-crimson-9 hover:border-cyan-9",
            isSink && "border-cyan-9",
            node.selected && "!border-yellow-11",
            className,
          )}
        >
          {children}
          {showSettings && Settings && <Settings />}
        </div>
      </RightClickMenu>

      {[...Array(sources)].map((_, i) => (
        <BlockHandle key={i} port={i} side="right" type="source" />
      ))}
    </div>
  )
}
