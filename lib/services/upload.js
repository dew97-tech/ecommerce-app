import fs from 'node:fs/promises'
import path from 'node:path'

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024

const IMAGE_SIGNATURES = [
  {
    ext: 'jpg',
    test: (b) => b.length > 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  },
  {
    ext: 'png',
    test: (b) =>
      b.length > 8 &&
      b[0] === 0x89 &&
      b[1] === 0x50 &&
      b[2] === 0x4e &&
      b[3] === 0x47 &&
      b[4] === 0x0d &&
      b[5] === 0x0a &&
      b[6] === 0x1a &&
      b[7] === 0x0a,
  },
  {
    ext: 'gif',
    test: (b) => b.length > 6 && b.toString('ascii', 0, 3) === 'GIF',
  },
  {
    ext: 'webp',
    test: (b) =>
      b.length > 12 &&
      b.toString('ascii', 0, 4) === 'RIFF' &&
      b.toString('ascii', 8, 12) === 'WEBP',
  },
]

function detectImageType(buffer) {
  return IMAGE_SIGNATURES.find((sig) => sig.test(buffer)) || null
}

export async function saveImageFile(file, subdir = '') {
  if (!file || typeof file === 'string' || typeof file.arrayBuffer !== 'function') {
    throw new Error('No file provided.')
  }

  if (file.size === 0) {
    throw new Error('The uploaded file is empty.')
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error('File too large. Maximum size is 5MB.')
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const detected = detectImageType(buffer)

  if (!detected) {
    throw new Error('Invalid image file. Only JPG, PNG, GIF and WebP are allowed.')
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', subdir)
  await fs.mkdir(uploadDir, { recursive: true })

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${detected.ext}`
  await fs.writeFile(path.join(uploadDir, filename), buffer)

  return `/uploads/${subdir ? `${subdir}/` : ''}${filename}`
}
