import cn from "classnames"
import { ReactNode, useReducer } from "react"
import { NodeProps } from "reactflow"

import { BlockHandle } from "@/blocks/components/BlockHandle"
import { RightClickMenu } from "@/blocks/components/RightClickMenu"

interface BaseBlockProps {
  node: NodeProps
  className?: string
  sources: number
  targets: number
  children?: ReactNode
}

export const BaseBlock = (props: BaseBlockProps) => {
  const { node, className, sources, targets, children } = props

  const [showSettings, toggleSettings] = useReducer((n) => !n, false)

  return (
    <div className="group">
      {[...Array(targets)].map((_, i) => (
        <BlockHandle port={sources + i} side="left" type="target" />
      ))}

      <RightClickMenu
        id={node.data.id}
        show={showSettings}
        toggle={toggleSettings}
      >
        <div
          className={cn(
            "relative",
            "border-2 border-crimson-9 rounded-2 hover:border-cyan-9",
            node.selected && "!border-yellow-11",
            className,
          )}
        >
          {children}
        </div>
      </RightClickMenu>

      {[...Array(sources)].map((_, i) => (
        <BlockHandle port={i} side="right" type="source" />
      ))}
    </div>
  )
}
