require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./config/db");
const allRouter = require("./routes");
const { Server } = require("socket.io");
const http = require("http");
const app = express();
const Chat = require("./models/chats");

// check db
db.then(() => {
  console.log("database terkoneksi");
}).catch((err) => {
  console.log(err);
});

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(allRouter);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
io.on("connection", (socket) => {
  // socket.on("message_function", (data) => {
  //   console.log(data);
  //   socket.emit("reply_function", { reply: data.message });
  // });

  socket.on("join_room", (data) => {
    console.log("join to room", data.konsulId);
    socket.join(data.konsulId);
  });

  // socket.on("send_message", (data) => {
  //   console.log("cekks", data);
  //   socket.emit("receive_message", { message: data.message });
  // });
  socket.on("send_message_to", (data) => {
    console.log("send to", data);
    Chat.create(data);
    io.in(data.konsulId).emit("receive_message", {
      sender: data.sender,
      message: data.message,
      konsulId: data.konsulId,
      timestamp: data.timestamp,
    });
  });

  socket.on("previous_chat", async (data) => {
    const chat = await Chat.find({ konsulId: data.konsulId });
    console.log(chat);
    io.in(data.konsulId).emit("get_previous_chat", chat);
  });
});

server.listen(process.env.PORT, () => {
  console.log("server running on http://localhost:" + process.env.PORT);  
});
