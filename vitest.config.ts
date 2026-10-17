import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const srcDir = fileURLToPath(new URL('./src', import.meta.url))
const alias = { '@': srcDir }

// Плагины и jsx-настройки задаются внутри каждого проекта:
// в режиме `projects` вложенные конфиги не наследуют корневые.
const jsx = { plugins: [react()], esbuild: { jsx: 'automatic' as const } }

export default defineConfig({
  test: {
    projects: [
      {
        ...jsx,
        resolve: { alias },
        test: {
          name: 'node',
          environment: 'node',
          include: ['src/tests/**/*.test.ts'],
          exclude: ['src/tests/speech.test.ts'],
          setupFiles: ['src/tests/setup.ts'],
          globalSetup: ['src/tests/global-setup.ts'],
          testTimeout: 30000,
          hookTimeout: 60000
        }
      },
      {
        ...jsx,
        resolve: { alias },
        test: {
          name: 'jsdom',
          environment: 'jsdom',
          include: ['src/tests/components/**/*.test.tsx', 'src/tests/speech.test.ts'],
          setupFiles: ['src/tests/dom-setup.ts'],
          testTimeout: 30000
        }
      }
    ]
  }
})
