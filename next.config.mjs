/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone-сборка: Dockerfile копирует .next/standalone и получает
  // образ без dev-зависимостей и без полного node_modules.
  output: 'standalone',

  poweredByHeader: false,
  reactStrictMode: true,

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Микрофон нужен упражнению «произношение», остальное запрещаем.
          { key: 'Permissions-Policy', value: 'camera=(), geolocation=(), payment=(), microphone=(self)' }
        ]
      },
      {
        // Ответы API не должны кэшироваться ни браузером, ни CDN:
        // это персональный прогресс, сердца и лига.
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0' }]
      }
    ]
  }
}

export default nextConfig
