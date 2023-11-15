/* eslint-disable @typescript-eslint/no-explicit-any */

export function timed<T extends () => any>(
  name: string,
  callback: T,
  threshold = 0.05,
) {
  const start = performance.now()
  const result = callback()
  const end = performance.now()
  const duration = end - start

  if (duration > threshold) {
    console.debug(`[t] ${name} took ${duration.toFixed(2)}ms`)
  }

  return result
}
