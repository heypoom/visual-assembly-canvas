import { map } from "nanostores"

interface ClockSpeedConfig {
  /** machine's clock speed (in cycles per tick) */
  machine: number

  /** canvas's clock speed (in cycles per tick) */
  canvas: number

  /** target amount of delay (in milliseconds) */
  delay: number
}

export const $clock = map<ClockSpeedConfig>({
  machine: 1,
  canvas: 1,
  delay: 1,
})
