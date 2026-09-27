import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"

import userRouter from "./routers/users";
import { verifyJWT } from "./middleware";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser())

app.use(userRouter);

app.use(verifyJWT);


app.listen(3001);