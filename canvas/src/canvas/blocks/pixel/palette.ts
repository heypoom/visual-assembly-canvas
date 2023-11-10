import {
  gray,
  red,
  green,
  yellow,
  blue,
  purple,
  cyan,
  whiteP3A,
} from "@radix-ui/colors"

export const palettes = {
  base: [
    "transparent",
    red.red9,
    green.green9,
    yellow.yellow9,
    blue.blue9,
    purple.purple9,
    cyan.cyan9,
    whiteP3A.whiteA12,
  ],
} satisfies Record<string, string[]>

export type PaletteKey = keyof typeof palettes

export const getPixelColor = (pixel: number, palette: PaletteKey): string =>
  palettes[palette][pixel] ?? palettes[palette][0]
