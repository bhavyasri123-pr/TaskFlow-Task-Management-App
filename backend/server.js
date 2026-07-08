import dotenv from "dotenv";
dotenv.config();

import http from "http";
import app from "./app.js";
import "./config/db.js";
import { initSocket } from "./config/socket.js";

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
