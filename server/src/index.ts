import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "colyseus";
import { monitor } from "@colyseus/monitor";
import { ChessRoom } from "./rooms/ChessRoom";

const port = Number(process.env.PORT) || 2567;
const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const gameServer = new Server({
  server,
});

gameServer.define("chess_room", ChessRoom);

app.use("/colyseus", monitor());

gameServer.onShutdown(() => {
  console.log("Server shutting down...");
});

server.listen(port, () => {
  console.log(`Dark Chess server listening on ws://localhost:${port}`);
  console.log(`Monitor: http://localhost:${port}/colyseus`);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled rejection:", err);
});
