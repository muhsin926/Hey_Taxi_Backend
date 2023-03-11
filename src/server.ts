import "dotenv/config";
import env from "./utility/validateEnv";
import express from "express";
import http from "http";
import serv from "./config/config";
import passRouter from "./router/passenger/passengerRouter";
import driverRouter from "./router/driver/driverRouter";
import adminRouter from "./router/admin/adminRouter";
import cors from "cors";
import { Server } from "socket.io";
import morgan from "morgan";

const app = express();
const server = http.createServer(app);

app.use(express.json());

app.use(cors());

// Fixing "413 Request Entity Too Large" Errors
app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 })
);
app.use(morgan("dev"));

// Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

app.use("/api/passenger", passRouter);
app.use("/api/driver", driverRouter);
app.use("/api/admin", adminRouter);

const onlineUsers = new Map();
const onlineDriver = new Map();
const onlineChaters = new Map();
io.on("connection", (socket) => {
  // add user to onlineUsers if not already exist
  socket.on("addUser", (id) => {
    !onlineUsers.get(id) && onlineUsers.set(id, socket.id);
    !onlineChaters.get(id) && onlineChaters.set(id, socket.id);
  });

  socket.on("addDriver", (id) => {
    !onlineDriver.get(id) && onlineDriver.set(id, socket.id);
    !onlineChaters.get(id) && onlineChaters.set(id, socket.id);
  });

  socket.on("send_msg", (data) => {
    const sendDriverSocket = onlineChaters.get(data.to);
    socket.to(sendDriverSocket).emit("receive_msg", data);
  });

  // send message to the client
  socket.on("send_request", (data) => {
    socket.broadcast.emit("receive_request", { data });
  });

  socket.on("ride_accept", (data) => {
    const sendPassengerSocket = onlineUsers.get(data.to._id);
    // Emit a ride-accepted event to the specific passenger
    socket.to(sendPassengerSocket).emit("ride_accept", data);
  });
});

const port = env.PORT;
try {
  serv();
  server.listen(port, () => console.log("server running on " + port));
} catch (error) {
  console.log(error);
}
