export const bitsToList = (nums: number[]): boolean[][] =>
  nums.map((n) => n.toString(2).split("").map(Number).map(Boolean))
