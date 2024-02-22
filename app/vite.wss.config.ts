import { resolve } from 'path';
import { defineConfig } from 'vite';


export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, './server/sockets.ts'),
            name: 'websocketserver',
            fileName: 'socket',
            formats: ['es']
        },
        rollupOptions: {
            external: ['drizzle-orm', 'http', 'nanoid', 'socket.io', 'path', 'vite', 'dotenv/config', 'drizzle-orm/sqlite-core', 'drizzle-orm/libsql', '@libsql/client', 'dotenv'],
            output: {
                globals: {
                    'drizzle-orm': 'drizzle-orm',
                    http: 'http',
                    nanoid: 'nanoid',
                    'socket.io': 'socket.io',
                    path: 'path',
                    vite: 'vite',
                    'dotenv/config': 'dotenv/config',
                    'drizzle-orm/sqlite-core': 'drizzle-orm/sqlite-core',
                    'drizzle-orm/libsql': 'drizzle-orm/libsql',
                    '@libsql/client': '@libsql/client',
                    dotenv: 'dotenv',
                },
            },
        },
        outDir: './build/server_ws',
        minify: false,
        sourcemap: true,
        emptyOutDir: true,
    },
});
