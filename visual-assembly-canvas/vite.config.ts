import {defineConfig} from 'vite'

import react from '@vitejs/plugin-react'
import awaits from 'vite-plugin-top-level-await'
import {ViteRsw} from 'vite-plugin-rsw'

export default defineConfig({
  plugins: [react(), awaits(), ViteRsw()],
})
