import { lezer } from "@lezer/generator/rollup"
import { TanStackRouterVite } from "@tanstack/router-vite-plugin"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import glsl from "vite-plugin-glsl"
import awaits from "vite-plugin-top-level-await"
import tsconfigPaths from "vite-tsconfig-paths"
import tailwindcss from '@tailwindcss/vite'
import wasmPack from 'vite-plugin-wasm-pack';

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react(),
    tailwindcss(),
    awaits(),
    glsl(),
    lezer(),
    TanStackRouterVite(),
    wasmPack('./machine-wasm')
  ],
})
