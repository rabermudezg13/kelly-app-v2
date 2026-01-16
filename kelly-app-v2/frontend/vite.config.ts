import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Listen on all interfaces so nginx can connect
    port: 3025,
    allowedHosts: [
      'kellyapp.fromcolombiawithcoffees.com',
      'localhost',
      '.fromcolombiawithcoffees.com', // Allow all subdomains
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:3026',
        changeOrigin: true,
      },
    },
  },
})



