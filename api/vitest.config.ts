import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		globals: true,
		environment: 'node',
		include: ['src/**/*.test.ts'],
		coverage: {
			reporter: ['text', 'html'],
			exclude: ['node_modules/', 'src/scripts/', 'src/db/'],
		},
	},
})
