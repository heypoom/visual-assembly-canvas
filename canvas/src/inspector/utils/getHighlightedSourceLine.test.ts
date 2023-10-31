import { expect, test } from "vitest"
import { getHighlightedSourceLine } from "./getHighlightedSourceLine"

test("should be able to get highlighted source line", () => {
  const source = `
    push 5
    push 10
    push 15
    push 1024
  `

  expect(getHighlightedSourceLine(source, 8)).toBe(3)
})
