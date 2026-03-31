import sharp from 'sharp'
import { existsSync, mkdirSync } from 'fs'

// Make sure icons folder exists
if (!existsSync('public/icons')) {
  mkdirSync('public/icons', { recursive: true })
}

const source = 'public/logo.png'

const sizes = [
  { name: 'pwa-64x64.png',                size: 64  },
  { name: 'pwa-192x192.png',              size: 192 },
  { name: 'pwa-512x512.png',              size: 512 },
  { name: 'apple-touch-icon-180x180.png', size: 180 },
  { name: 'pwa-96x96.png',               size: 96  },
]

for (const { name, size } of sizes) {
  await sharp(source)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .png()
    .toFile(`public/icons/${name}`)
  console.log(`✅ Generated public/icons/${name}`)
}

// Maskable icon — adds padding so logo isn't clipped on Android
await sharp(source)
  .resize(420, 420, {
    fit: 'contain',
    background: { r: 37, g: 99, b: 235, alpha: 1 } // LaundroCare blue background
  })
  .extend({
    top: 46, bottom: 46, left: 46, right: 46,
    background: { r: 37, g: 99, b: 235, alpha: 1 }
  })
  .resize(512, 512)
  .png()
  .toFile('public/icons/maskable-icon-512x512.png')

console.log('✅ Generated public/icons/maskable-icon-512x512.png')
console.log('🎉 All icons generated successfully!')
