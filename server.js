import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import { readdirSync } from "fs";

import morgan from "morgan";
require("dotenv").config();

const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  path: "/socket.io",
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  },
});

const corsOptions = {
  origin: ["http://localhost:3000"],
  optionsSuccessStatus: 200,
};

// db connecting

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("DB connected");
  })
  .catch((err) => console.error("DB CONNECTION ERROR =>", err));

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [process.env.CLIENT_URL],
  })
);

readdirSync("./routes").map((r) => app.use("/api", require(`./routes/${r}`)));

app.get("/", (req, res) => {
  res.send("Hello, world!");
});
// socketio
io.on("connect", (socket) => {
  // console.log("SOCKET>IO", socket.id);
  socket.on("new-post", (newPost) => {
    // console.log("socketio new post => ", newPost);
    socket.broadcast.emit("new-post", newPost);
  });
});

const port = process.env.PORT || 5001;

http.listen(port, () => console.log(`Server is running on port ${port}`));
