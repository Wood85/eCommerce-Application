import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
		environment: 'jsdom',
		include: ['**/*.{test,spec}.{js,mjs,ts}']
  },
})