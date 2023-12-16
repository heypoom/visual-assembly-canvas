export const palettes = {
  base: [
    "transparent",
    "#fff",
    ...[...Array(360)].map((_, i) => `hsl(${i}, 100%, 50%)`),
  ],
} satisfies Record<string, string[]>

export const paletteOptions = Object.keys(palettes).map((value) => ({
  value,
  label: value,
}))

export type PaletteKey = keyof typeof palettes

export const getPixelColor = (pixel: number, palette: PaletteKey): string =>
  palettes[palette][pixel] ?? palettes[palette][0]
