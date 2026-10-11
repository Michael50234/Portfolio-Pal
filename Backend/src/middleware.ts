import type { NextFunction, Request, Response } from "express";
import { errors, jwtVerify } from "jose";

import sendError from "./utilities/error";
import { prisma } from "./prismaClient";

const secret = new TextEncoder().encode(process.env.SECRET_KEY);

export const verifyJWT = async (req: Request, res: Response, next: NextFunction) => {
    const access_token = req.cookies.access_token;

    if (!access_token) {
        return sendError(401, "Not authenticated", res);
    }

    try {
        const { payload }: { payload: { userId: string }} = await jwtVerify(access_token, secret, {
            algorithms: ["HS256"]
        })

        
        const user = await prisma.user.findUnique({
            where: {
                id: payload.userId
            },
            select: {
                username: true,
                id: true
            }
        })
        
        if(!user) {
            return sendError(401, "Not authenticated", res)
        }

        req.user = { userId: user.id, username: user.username };
        next();
    } catch(error) {
        // default internal server error
        let status = 500;
        let message = "Internal server error";

        if(error instanceof errors.JWTExpired) {
            status = 401
            message = "Token expired"
        } else if(error instanceof errors.JOSEError) {
            status = 401;
            message = "Invalid token"
        }

        return sendError(status, message, res)
    }
}