import { sveltekit } from "@sveltejs/kit/vite";
import type { UserConfig, ViteDevServer } from "vite";
import { attach_socket_server } from "./server/sockets.ts";

const socket_io_plugin = {
    name: "socket.io plugin",
    configureServer(server: ViteDevServer) {
        attach_socket_server(server.httpServer as any);
    },
};

const config: UserConfig = {
    plugins: [sveltekit(), socket_io_plugin],
};

export default config;
