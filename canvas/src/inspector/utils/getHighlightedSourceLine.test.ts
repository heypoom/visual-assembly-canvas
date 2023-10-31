import { expect, test } from "vitest"
import { getSourceHighlightMap } from "./getHighlightedSourceLine"

test("should be able to get highlighted source line", () => {
  const S1 = `
    push 5
    push 10
    push 15
    push 1024
  `

  const M1 = getSourceHighlightMap(S1)
  expect(M1.get(8)).toBe(4)

  const S2 = `
    .string hello_world "Hello, world!"
    .string foo "foo bar"

    load_string hello_world
    print

    .string sunshine "Sunshine!"

    load_string sunshine
    print

    .value bar 0xDEAD
    .value baz 0xAAAA

    push bar
    push baz
  `

  const M2 = getSourceHighlightMap(S2)
  expect(M2.get(8)).toBe(15)
})
