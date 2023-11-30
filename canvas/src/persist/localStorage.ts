import { PersistenceDriver } from "./types"

const KEY = "CANVAS_STATE"

export const LocalStorageDriver: PersistenceDriver = {
  save(serialize) {
    localStorage.setItem(KEY, JSON.stringify(serialize()))
  },

  load(restore) {
    const persist = localStorage.getItem(KEY)
    if (!persist) return

    restore(JSON.parse(persist))
  },
}
