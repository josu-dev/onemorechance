import express from "express";
import { handler } from "../build/handler.js";
import { attach_socket_server, log } from "../build/server_ws/socket.js";


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
