import { map } from "nanostores"

const PAGE_SIZE = 100

type MemoryPageConfig = { [id: number]: { page: number; size?: number } }

export const $memoryPageConfig = map<MemoryPageConfig>({})

export const pageToOffset = (page: number) => page * PAGE_SIZE
export const offsetToPage = (offset: number) => Math.floor(offset / PAGE_SIZE)
