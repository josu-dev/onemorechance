import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { attach_socket_server } from "./server/sockets.ts";


export default defineConfig({
    plugins: [
        sveltekit(),
        {
            name: "socket.io plugin",
            configureServer(server) {
                if (!server.httpServer) {
                    throw new Error("Cannot run vite on middleware mode");
                }
                attach_socket_server(server.httpServer);
            },
        }
    ]
});
