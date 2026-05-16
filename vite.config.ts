import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	optimizeDeps: {
		esbuildOptions: {
			// jsPDF optionally imports these for SVG/HTML rendering — we don't use those features.
			// Without this, Vite's dep pre-bundler fails to resolve them in dev.
			external: ['canvg', 'html2canvas', 'dompurify'],
		},
	},
	build: {
		rollupOptions: {
			external: ['canvg', 'html2canvas', 'dompurify'],
		},
	},
	test: {
		include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
		environment: 'node',
		alias: {
			$lib: new URL('./src/lib', import.meta.url).pathname,
		},
	},
});
