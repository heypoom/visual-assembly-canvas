import { lezer } from "@lezer/generator/rollup"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import glsl from "vite-plugin-glsl"
import { ViteRsw } from "vite-plugin-rsw"
import awaits from "vite-plugin-top-level-await"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [tsconfigPaths(), react(), awaits(), ViteRsw(), glsl(), lezer()],
})
