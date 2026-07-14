import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Photo server (School/backend/photo-server) hands out presigned S3 URLs — keeps the
      // AWS secret key server-side instead of bundling it into the browser build.
      "/api": "http://localhost:4001",
    },
  },
})
