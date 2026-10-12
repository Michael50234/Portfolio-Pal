import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"

import authRouter from "./routers/auth";
import { verifyJWT } from "./middleware";
import { stocksRouter } from "./routers/stocks";
import { tradesRouter } from "./routers/trades";
import { userRouter } from "./routers/user";
import { watchListRouter } from "./routers/watchList";
import redisClient from "./redisClient";

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser())

app.use("/auth", authRouter);

app.use(verifyJWT);

app.use("/stocks", stocksRouter);
app.use("/trades", tradesRouter);
app.use("/user", userRouter);
app.use("/watchList", watchListRouter)

// Connect redis client to redis database
await redisClient.connect();
app.listen(process.env.PORT);