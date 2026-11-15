import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate', // Automatically updates the app when a new version is pushed
      includeAssets: ['favicon.svg', 'icons.svg'],
      manifest: {
        name: 'AbleWork: PWD Employment',
        short_name: 'AbleWork',
        description: 'An inclusive employment platform connecting PWDs with employers.',
        theme_color: '#03045E',
        background_color: '#f4f4f4',
        display: 'standalone',
        start_url: '/login', // <-- Redirects to login when opening the installed app
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/favicon.svg',
            sizes: '192x192 512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: '/icons.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any'
          }
        ]
      }
    })
  ],
})