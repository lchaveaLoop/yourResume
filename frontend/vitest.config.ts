import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'happy-dom',
      include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
      setupFiles: ['tests/setup/vitest.setup.ts'],
      globals: false,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        include: ['src/**/*.{ts,vue}'],
        exclude: ['src/env.d.ts'],
      },
    },
  }),
)
