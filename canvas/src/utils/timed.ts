/* eslint-disable @typescript-eslint/no-explicit-any */

const PROFILING = true

export function timed<T extends () => any>(
  name: string,
  callback: T,
  threshold = 0.25,
) {
  if (!PROFILING) return callback()

  const start = performance.now()
  const result = callback()
  const end = performance.now()
  const duration = end - start

  if (duration > threshold) {
    console.debug(`[P] ${name} took ${duration.toFixed(2)}ms`)
  }

  return result
}
