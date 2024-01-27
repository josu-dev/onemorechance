import express from "express";
// @ts-expect-error (only available after build)
import { handler } from "../build/handler.js";
// @ts-expect-error (only available after build)
import { attach_sockets } from "./sockets.js";


const PORT = process.env.PORT || 3000;
const app = express();

const server = app.listen(PORT, () => {
    console.info("server is listening on port", PORT);
});

app.use(handler);

attach_sockets(server);
