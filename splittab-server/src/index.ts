import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from "./routes/auth";
import tabRoutes from "./routes/tabs";
import expenseRoutes from "./routes/expenses";

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;

export const io = new Server(httpServer, {
  cors: {
    origin: true,
    credentials: true,
  },
});

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);
app.use("/tabs", tabRoutes);
app.use("/tabs/:id/expenses", expenseRoutes);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

io.on("connection", (socket) => {
  console.log(`socket connected: ${socket.id}`);

  socket.on("join-tab", (tabId: string) => {
    socket.join(tabId);
    console.log(`${socket.id} joined room ${tabId}`);
  });

  socket.on("leave-tab", (tabId: string) => {
    socket.leave(tabId);
    console.log(`${socket.id} left room ${tabId}`);
  });

  socket.on("disconnect", () => {
    console.log(`socket disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
