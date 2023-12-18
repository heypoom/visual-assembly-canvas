export const bitsToList = (nums: number[]): boolean[][] =>
  nums.map((n) =>
    n.toString(2).padEnd(8, "0").split("").map(Number).map(Boolean),
  )
