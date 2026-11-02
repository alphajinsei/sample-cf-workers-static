// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	// posts/hello.html の形で出力し、/posts/hello にリダイレクトなしで応答させる
	build: { format: 'file' },
});
