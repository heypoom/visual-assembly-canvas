import { map } from "nanostores"

import { updateMemoryViewer } from "@/store/results"

export const DEFAULT_PAGE_OFFSET = 0x4100
export const DEFAULT_PAGE_SIZE = 50

type MemoryPageConfig = { [id: number]: { page: number; size?: number } }

/// Stores the current page index, in addition to page size.
export const $memoryPageConfig = map<MemoryPageConfig>({})

// Stores the current memory page values.
export const $memoryPages = map<Record<number, number[]>>({})

export const offsetToPage = (offset: number, size = DEFAULT_PAGE_SIZE) =>
  Math.floor(offset / size)

export const DEFAULT_PAGE = offsetToPage(DEFAULT_PAGE_OFFSET)

export const pageToOffset = (page: number | null, size = DEFAULT_PAGE_SIZE) =>
  (page ?? DEFAULT_PAGE) * size

const getPage = (id: number) => {
  const { page } = $memoryPageConfig.get()[id] ?? {}

  return page ?? DEFAULT_PAGE
}

export const setMemPage = (id: number, page: number) => {
  $memoryPageConfig.setKey(id, {
    ...$memoryPageConfig.get()[id],
    page,
  })

  updateMemoryViewer(id)
}

export const nextMemPage = (id: number) =>
  setMemPage(id, Math.min(getPage(id) + 1, 1000))

export const prevMemPage = (id: number) =>
  setMemPage(id, Math.max(getPage(id) - 1, 0))

export const gotoDefaultPage = (id: number) => setMemPage(id, DEFAULT_PAGE)
