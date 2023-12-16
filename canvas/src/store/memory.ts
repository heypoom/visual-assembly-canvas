import { map } from "nanostores"

export const DEFAULT_PAGE_OFFSET = 0x4100
export const DEFAULT_PAGE_SIZE = 104

type MemoryPageConfig = { [id: number]: { page: number; size?: number } }

/// Stores the current page index, in addition to page size.
export const $memoryPageConfig = map<MemoryPageConfig>({})

// Stores the current memory page values.
export const $memoryPages = map<Record<number, number[]>>({})

export const offsetToPage = (offset: number, size = DEFAULT_PAGE_SIZE) =>
  Math.floor(offset / size)

export const pageToOffset = (page: number | null, size = DEFAULT_PAGE_SIZE) =>
  (page ?? offsetToPage(DEFAULT_PAGE_OFFSET)) * size
