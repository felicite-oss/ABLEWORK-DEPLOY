import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo192.png', 'logo512.png'],
      manifest: {
        name: 'AbleWork: PWD Employment',
        short_name: 'AbleWork',
        description: 'An inclusive employment platform connecting PWDs with employers.',
        
        // CHANGE BOTH OF THESE TO LIGHT COLORS
        theme_color: '#ffffff', 
        background_color: '#ffffff', 
        
        display: 'standalone',
        start_url: '/login',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/logo192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/logo512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})