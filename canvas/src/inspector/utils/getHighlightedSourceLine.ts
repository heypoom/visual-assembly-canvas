export function getHighlightedSourceLine(
  source: string,
  pc: number,
): number | null {
  const lines = source.split("\n")

  let curr = 0
  let currLine = 0

  for (const line of lines) {
    const [opcode, ...args] = line.trim().split(" ")

    currLine++

    // Skip comments and directives.
    if (line.length === 0) continue
    if (opcode.startsWith("//")) continue
    if (opcode.startsWith(".")) continue

    const argCount = args.length
    curr += 1 + argCount

    if (curr >= pc) return currLine - 1
  }

  return null
}
