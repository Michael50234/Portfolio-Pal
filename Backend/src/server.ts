import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"

import userRouter from "./routers/users";
import { verifyJWT } from "./middleware";

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(express.json());
app.use(cookieParser())

app.use("/user", userRouter);

app.use(verifyJWT);

app.listen(process.env.PORT);