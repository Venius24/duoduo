import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Дуодуо — учи языки играя',
    short_name: 'Дуодуо',
    description: 'Английский и китайский с русского: уроки, боссы, умные повторения',
    start_url: '/learn',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#58CC02',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }]
  }
}
