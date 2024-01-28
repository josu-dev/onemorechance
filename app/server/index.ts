import express from "express";
// @ts-ignore - no types
import { handler } from "../build/handler.js";
import { attach_sockets } from "./sockets.js";


const PORT = process.env.PORT || 3000;
const app = express();

const server = app.listen(PORT, () => {
    console.info("server is listening on port", PORT);
});

app.use(handler);

attach_sockets(server);
