import { Icon } from "@iconify/react"
import { useStore } from "@nanostores/react"
import cn from "classnames"
import { memo, useMemo } from "react"

import { SmallMemoryViewer } from "@/blocks/machine/components/SmallMemoryViewer"
import {
  $memoryPageConfig,
  $memoryPages,
  DEFAULT_PAGE_SIZE,
  pageToOffset,
} from "@/store/memory"
import { MachineState } from "@/types/MachineState"

import { ErrorIndicator } from "./ErrorIndicator"

interface Props {
  id: number
  state: MachineState
}

export const MachineValueViewer = memo((props: Props) => {
  const { id, state } = props
  const { registers } = state

  const pageConfigs = useStore($memoryPageConfig)
  const pageConfig = pageConfigs[id] ?? { page: null }

  const pages = useStore($memoryPages)
  const memory = pages[id]

  const memStart = pageToOffset(pageConfig.page)

  const memEnd =
    pageToOffset(pageConfig.page) + (pageConfig.size ?? DEFAULT_PAGE_SIZE)

  return (
    <div className="space-y-[6px]">
      {state.error && (
        <div className="text-1 text-orange-11 px-1 mx-1">
          <ErrorIndicator error={state.error} />
        </div>
      )}

      {state.logs?.length ? (
        <div className="text-cyan-11 text-1 font-medium px-1 bg-stone-800 mx-1">
          {state.logs.map((log, i) => (
            <div key={i}>&gt; {log}</div>
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-y-1">
        {registers && (
          <div className="text-green-11 text-1 px-1 bg-stone-800 mx-1 flex gap-x-2">
            <div>
              <span>PC</span>{" "}
              <strong>{registers.pc.toString().padStart(2, "0")}</strong>
            </div>

            <div>
              <span>SP</span> <strong>{registers.sp}</strong>
            </div>

            <div>
              <span>FP</span> <strong>{registers.fp}</strong>
            </div>

            <div>
              <span>ID</span> <strong>{id}</strong>
            </div>

            {state.inboxSize > 0 && (
              <div className={cn(state.inboxSize > 50 && "text-orange-11")}>
                <span>IB</span> <strong>{state.inboxSize}</strong>
              </div>
            )}

            {state.outboxSize > 0 && (
              <div>
                <span>OB</span> <strong>{state.outboxSize}</strong>
              </div>
            )}
          </div>
        )}

        <SmallMemoryViewer memory={memory} />
      </div>

      <div className="flex text-1 justify-between px-2 items-center">
        <div>
          <Icon icon="material-symbols:arrow-circle-left-outline-rounded" />
        </div>

        <div>
          0x{memStart.toString(16).toUpperCase()} - 0x
          {memEnd.toString(16).toUpperCase()}
        </div>

        <div>
          <Icon icon="material-symbols:arrow-circle-right-outline-rounded" />
        </div>
      </div>
    </div>
  )
})
