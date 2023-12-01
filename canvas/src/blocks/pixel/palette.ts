export const palettes = {
  base: [
    "transparent",
    ...[...Array(255)].map((_, i) => `hsl(${i}, 100%, 50%)`),
  ],
} satisfies Record<string, string[]>

export type PaletteKey = keyof typeof palettes

export const getPixelColor = (pixel: number, palette: PaletteKey): string =>
  palettes[palette][pixel] ?? palettes[palette][0]
