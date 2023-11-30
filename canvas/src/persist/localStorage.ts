import { PersistenceDriver } from "./types"

export const STORAGE_KEY = "CANVAS_STATE"

export const LocalStorageDriver: PersistenceDriver = {
  save(serialize) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialize()))
  },

  load(restore) {
    const persist = localStorage.getItem(STORAGE_KEY)
    if (!persist) return

    restore(JSON.parse(persist))
  },
}
