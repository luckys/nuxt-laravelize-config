import { defineConfig } from 'vitest/config'

export const vitestBaseConfig = defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.ts'],
  },
})
