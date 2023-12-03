import { useEffect, useRef } from "react"

import { LocalStorageDriver } from "../drivers/localStorage"
import { PersistConfig } from "../types"
import { useSaveState } from "./useSaveState"

type Timer = ReturnType<typeof setInterval>

const AUTO_SAVE_INTERVAL = 3000

export function useAutoSave(config: PersistConfig = {}) {
  const { driver = LocalStorageDriver } = config

  const { serialize, restore, clear } = useSaveState()

  const restored = useRef(false)
  const saveTimer = useRef<Timer>()

  useEffect(() => {
    // This operation must be done exactly once.
    if (!restored.current) {
      setTimeout(() => {
        driver.load(restore)
      }, 0)
    }

    saveTimer.current = setInterval(() => {
      driver.save(serialize)
    }, AUTO_SAVE_INTERVAL)

    // @ts-ignore
    window.persist = { driver, serialize, restore, clear }

    restored.current = true

    return () => {
      clearInterval(saveTimer.current)
    }
  }, [])

  return { serialize, restore, clear }
}
