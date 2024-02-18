import express from "express";
import { handler } from "../build/handler.js";
import { attach_socket_server } from "../build/server_ws/server/sockets.js";


const PORT = process.env.PORT || 3000;
const app = express();

const server = app.listen(PORT, () => {
    console.info("server is listening on port", PORT);
});

app.use(handler);

attach_socket_server(server);
