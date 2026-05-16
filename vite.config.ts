import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	build: {
		rollupOptions: {
			// jsPDF optionally imports these for SVG/HTML rendering — we don't use those features.
			// Marking them external prevents the "failed to resolve" build error.
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
