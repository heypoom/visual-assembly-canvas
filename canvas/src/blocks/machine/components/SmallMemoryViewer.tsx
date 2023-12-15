import cn from "classnames"
import { useMemo } from "react"

import { findLastNonZeroIndex } from "@/utils/findLastNonZero"

interface Props {
  stack: number[]
}

export const SmallMemoryViewer = (props: Props) => {
  const { stack } = props

  const lastStackValue = useMemo(() => {
    return findLastNonZeroIndex(stack ?? [])
  }, [stack])

  const isMemoryEnabled = lastStackValue > -1

  if (!stack?.length || !isMemoryEnabled) return null

  return (
    <div className="px-1 flex flex-wrap max-w-[300px] nodrag">
      {stack.map((u, i) => {
        const unset = i > lastStackValue
        if (unset) return null

        return (
          <div>
            <div
              className={cn(
                "text-1 text-crimson-11 bg-stone-800 mx-1",
                u === 0 && "text-gray-8",
              )}
              key={i}
            >
              {u.toString().padStart(2, "0")}
            </div>
          </div>
        )
      })}
    </div>
  )
}
