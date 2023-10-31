export function getSourceHighlightMap(source: string): Map<number, number> {
  const lines = source.split("\n")
  const mapping = new Map<number, number>()

  let pc = 0
  let linePos = 0

  for (const line of lines) {
    const [opcode, ...args] = line.trim().split(" ")
    linePos++

    // Skip comments, labels and directives.
    if (line.length === 0) continue
    if (opcode.endsWith(":")) continue
    if (opcode.startsWith("//")) continue
    if (opcode.startsWith(".")) continue

    const argCount = args.length
    pc += 1 + argCount

    mapping.set(pc, linePos - 1)
  }

  return mapping
}
