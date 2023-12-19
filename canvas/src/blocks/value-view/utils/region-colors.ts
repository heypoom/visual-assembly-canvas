import { random } from "lodash"

export const regionPalettes: string[] = [
  "bg-cyan-7 text-cyan-11 hover:text-cyan-12",
  "bg-violet-7 text-violet-11 hover:text-violet-12",
  "bg-tomato-7 text-tomato-11 hover:text-tomato-12",
  "bg-jade-7 text-jade-11 hover:text-jade-12",
  "bg-orange-6 text-orange-11 hover:text-orange-12",
  "bg-grass-7 text-grass-11 hover:text-grass-12",
  "bg-purple-7 text-purple-11 hover:text-purple-12",
  "bg-blue-7 text-blue-10 hover:text-blue-12",
  "bg-teal-7 text-teal-11 hover:text-teal-12",
]

// Get a consistent region color.
export const getRegionClassName = (id: number): string =>
  regionPalettes[id % regionPalettes.length]

export const getRandomRegionColor = () => random(0, regionPalettes.length)
