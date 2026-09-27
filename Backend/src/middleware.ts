import type { NextFunction, Request, Response } from "express";
import { jwtVerify } from "jose";

import sendError from "./utilities/error";
import { prisma } from "./prismaClient";

const secret = new TextEncoder().encode(process.env.SECRET_KEY);

export const verifyJWT = async (req: Request, res: Response, next: NextFunction) => {
    const access_token = req.cookies.access_token;

    try {
        // Verify JWT
        const { payload }: { payload: { userId: string }} = await jwtVerify(access_token, secret, {
            algorithms: ["HS256"]
        })

        const user = prisma.user.findUnique({
            where: {
                id: payload.userId
            }
        })
        
        if(!user) {
            return sendError(404, "User not found", res)
        }

        req.user = user;
        next();
    } catch {
        return sendError(500, "Internal server error", res)
    }
}