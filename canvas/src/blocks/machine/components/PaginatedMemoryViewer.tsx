import { Icon } from "@iconify/react"
import { useStore } from "@nanostores/react"
import cn from "classnames"
import { useState } from "react"

import { MemoryViewer } from "@/blocks/machine/components/MemoryViewer"
import {
  $memoryPageConfig,
  $memoryPages,
  DEFAULT_PAGE_SIZE,
  gotoDefaultPage,
  nextMemPage,
  pageToOffset,
  prevMemPage,
  setMemPage,
} from "@/store/memory"

interface Props {
  id: number
}

export const PaginatedMemoryViewer = (props: Props) => {
  const { id } = props

  const [highlightedAddr, highlightAddr] = useState<number | null>(null)

  const pageConfigs = useStore($memoryPageConfig)
  const pageConfig = pageConfigs[id] ?? { page: null }

  const pages = useStore($memoryPages)
  const memory = pages[id]

  const memStart = pageToOffset(pageConfig.page)

  const memEnd =
    pageToOffset(pageConfig.page) + (pageConfig.size ?? DEFAULT_PAGE_SIZE)

  const hex = true
  const minDigits = 4

  const base = hex ? 16 : 10
  const pad = hex ? minDigits : minDigits + 1

  const show = (n: number) =>
    `${hex ? "0x" : ""}${n.toString(base).padStart(pad, "0").toUpperCase()}`

  return (
    <div className="flex flex-col gap-y-1 w-fit">
      <MemoryViewer memory={memory} begin={memStart} onHover={highlightAddr} />

      <div className="flex text-1 justify-between px-2 items-center">
        <button
          onClick={() => prevMemPage(id)}
          className={cn(
            "nodrag text-gray-11 hover:text-crimson-11 cursor-pointer",
            memStart === 0 && "invisible",
          )}
        >
          <Icon icon="material-symbols:arrow-circle-left-outline-rounded" />
        </button>

        {highlightedAddr === null ? (
          <div className="text-[10px] text-gray-11">
            <span
              onClick={() => setMemPage(id, 0)}
              className="hover:text-gray-12 nodrag cursor-pointer"
            >
              {show(memStart)}
            </span>

            <span> - </span>

            <span
              onClick={() => gotoDefaultPage(id)}
              className="hover:text-gray-12 nodrag cursor-pointer"
            >
              {show(memEnd)}
            </span>
          </div>
        ) : (
          <div className="text-[10px] text-crimson-12">
            {show(highlightedAddr)}
          </div>
        )}

        <button
          onClick={() => nextMemPage(id)}
          className="nodrag text-gray-11 hover:text-crimson-11 cursor-pointer"
        >
          <Icon icon="material-symbols:arrow-circle-right-outline-rounded" />
        </button>
      </div>
    </div>
  )
}
