import cn from "classnames"
import { useMemo } from "react"

import { MachineState } from "@/types/MachineState"
import { findLastNonZeroIndex } from "@/utils/findLastNonZero"

import { ErrorIndicator } from "./ErrorIndicator"

interface Props {
  id: number
  state: MachineState
}

export const MachineValueViewer = (props: Props) => {
  const { id, state } = props
  const { registers } = state

  const lastStackValue = useMemo(() => {
    return findLastNonZeroIndex(state.stack ?? [])
  }, [state.stack])

  return (
    <div className="space-y-1">
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

      {state.stack && (
        <div className="px-1 flex flex-wrap max-w-[300px]">
          {state.stack.map((u, i) => {
            const unset = i > lastStackValue
            if (unset) return null

            return (
              <div
                className={cn(
                  "text-1 text-crimson-11 bg-stone-800 mx-1",
                  u === 0 && "text-gray-8",
                )}
                key={i}
              >
                {u.toString().padStart(2, "0")}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
