import { useEffect, useRef } from "react"

import { LocalStorageDriver } from "./localStorage"

import { PersistConfig } from "./types"
import { useSaveState } from "./useSaveState"

type Timer = ReturnType<typeof setInterval>

const AUTO_SAVE_INTERVAL = 3000

export function useAutoSave(config: PersistConfig = {}) {
  const { driver = LocalStorageDriver } = config

  const { getState, restore, clear } = useSaveState()

  const restored = useRef(false)
  const saveTimer = useRef<Timer>()

  useEffect(() => {
    if (restored.current) return

    setTimeout(() => {
      driver.load(restore)
    }, 0)

    saveTimer.current = setInterval(() => {
      driver.save(getState)
    }, AUTO_SAVE_INTERVAL)

    restored.current = true

    return () => {
      clearInterval(saveTimer.current)
    }
  }, [])

  return { getState, restore, clear }
}
