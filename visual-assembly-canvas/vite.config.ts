import {defineConfig} from 'vite'

import react from '@vitejs/plugin-react'
import awaits from 'vite-plugin-top-level-await'
import {ViteRsw} from 'vite-plugin-rsw'
import glsl from 'vite-plugin-glsl'
import {lezer} from '@lezer/generator/rollup'

export default defineConfig({
  plugins: [react(), awaits(), ViteRsw(), glsl(), lezer()],
})
