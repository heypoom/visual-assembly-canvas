export function flipBit(n: number, bit: number): number {
  const totalBits = Math.floor(Math.log2(n)) + 1
  if (bit < 0 || bit >= totalBits) return n

  return n ^ (1 << (totalBits - 1 - bit))
}
