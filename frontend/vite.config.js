import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allows access from any device on the network
    port: 5173, // Ensure this is the correct port
    strictPort: true,
    hmr: {
      clientPort: 5173, // Fix WebSocket issues
    },
  },
})
