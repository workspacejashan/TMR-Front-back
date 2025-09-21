import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['vite.svg'],
      manifest: {
        name: 'ThatsMyRecruiter',
        short_name: 'MyRecruiter',
        description: 'A personal AI recruiter for candidates, managing all interactions through a streamlined chat interface.',
        theme_color: '#4f46e5',
        background_color: '#f8fafc',
        icons: [
          {
            src: '/vite.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      external: [
        'react',
        // Use a regex to match 'react-dom' and 'react-dom/client' etc.
        /^react-dom/, 
      ]
    }
  }
})