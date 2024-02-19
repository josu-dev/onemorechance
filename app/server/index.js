import express from "express";
import { handler } from "../build/handler.js";
import { attach_socket_server } from "../build/server_ws/server/sockets.js";
import { log } from "../build/server_ws/server/utils.js";


const PORT = process.env.PORT || 3000;

const app = express();

app.get('/healthz', (req, res) => {
    res
        .setHeader('Content-Type', 'text/plain')
        .status(200)
        .send('OK');
});

app.use(handler);

const server = app.listen(PORT, () => {
    log.core("Server listening on port", PORT);
});

attach_socket_server(server);

server.on('error', (err) => {
    log.fatal("Server error", err);
});

server.on('close', () => {
    log.core("Server closed");
});
