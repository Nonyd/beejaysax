import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export default cloudinary

export const CLOUDINARY_UPLOAD_PRESET = 'beejaysax_unsigned'
export const CLOUDINARY_EVENTS_PRESET = 'beejaysax_events'
export const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!

// Helper to build a Cloudinary URL with transformations
export function cloudinaryUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    quality?: number | 'auto'
    format?: 'auto' | 'webp' | 'avif' | 'jpg'
    crop?: 'fill' | 'fit' | 'scale' | 'thumb'
  } = {}
): string {
  const { width, height, quality = 'auto', format = 'auto', crop = 'fill' } = options
  const transforms = [
    width && `w_${width}`,
    height && `h_${height}`,
    crop && `c_${crop}`,
    `q_${quality}`,
    `f_${format}`,
  ]
    .filter(Boolean)
    .join(',')

  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${transforms}/${publicId}`
}
