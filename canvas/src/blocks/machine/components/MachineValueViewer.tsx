import { Icon } from "@iconify/react"
import cn from "classnames"
import { memo, useMemo } from "react"

import { SmallMemoryViewer } from "@/blocks/machine/components/SmallMemoryViewer"
import { MachineState } from "@/types/MachineState"

import { ErrorIndicator } from "./ErrorIndicator"

interface Props {
  id: number
  state: MachineState
}

export const MachineValueViewer = memo((props: Props) => {
  const { id, state } = props
  const { registers } = state

  const isMemoryEnabled = useMemo(() => {
    return state.stack?.some((x) => x !== 0)
  }, [state.stack])

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

      <div className="flex justify-between items-end">
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

          <SmallMemoryViewer memory={state.stack ?? []} />
        </div>

        <div className="flex justify-end">
          {isMemoryEnabled && (
            <div className="text-2 nodrag cursor-pointer text-gray-10 hover:text-purple-11">
              <Icon icon="material-symbols:memory-alt-outline" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
})
