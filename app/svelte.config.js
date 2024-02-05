import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';


/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        adapter: adapter(),
        alias: {
            $comps: './src/lib/components',
            $game: './src/game',
        }
    },
    preprocess: vitePreprocess({
        postcss: true,
    })
};

export default config;
