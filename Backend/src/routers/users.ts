import bcrypt from "bcrypt";
import express from "express";
import { prisma } from "../prismaClient";

import { createJWT } from "../utilities/auth";
import sendError from "../utilities/error";
import { loginSchema, registerSchema } from "../vaidation/usersSchemas";
import { verifyJWT } from "../middleware";

const userRouter = express.Router();

userRouter.get('/login', async (req, res) => {
    const parsed = loginSchema.safeParse({
        username: req.body.username,
        password: req.body.password
    })

    if(!parsed.success) {
        return sendError(401, "Bad request", res);
    }

    const { username, password } = parsed.data;

    // Authenticate User
    let user;
    try {
        user = await prisma.user.findUnique({
            where: {
                username: username
            }
        });

        if(!user) {
            return sendError(404, "User does not exist", res)
        }
    } catch {
        return sendError(500, "Internal server error", res)
    }

    const isValid = await bcrypt.compare(password, user.password)

    if(!isValid) {
        return sendError(401, "Username or password incorrect", res)
    }

    // Issue JWT token
    const token = await createJWT(user.id)
    res.cookie('access_token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        maxAge: 60 * 1000 * 30,
        path: '/'
    });

    return res.sendStatus(204);
})

userRouter.post('/sign-up', async (req, res) => {
    const parsed = registerSchema.safeParse({
        username: req.body.username,
        password: req.body.password
    })

    if(!parsed.success) {
        return sendError(401, "Bad request", res);
    }

    const { username, password } = parsed.data;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        // Check if username taken
        const existingUser = await prisma.user.findUnique({
            where: {
                username: username
            }
        });

        if(existingUser) {
            return sendError(409,  "Username already taken", res)
        }

        const user = await prisma.user.create({
            data: {
                username: username,
                password: hashedPassword,
            }
        });

        // Issue JWT token
        const token = await createJWT(user.id);
        res.cookie('access_token', token, {
            httpOnly: true,
            secure: true,
            sameSite: "lax", 
            maxAge: 1000 * 60 * 30,
            path: "/"
        });

        return res.sendStatus(204);
    } catch {
        return sendError(500,  "Internal server error", res)
    }  
})

userRouter.use(verifyJWT);

export default userRouter;