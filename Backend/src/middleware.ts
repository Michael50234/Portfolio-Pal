import type { NextFunction, Request, Response } from "express";
import { errors, jwtVerify } from "jose";

import sendError from "./utilities/error";
import { prisma } from "./prismaClient";

const secret = new TextEncoder().encode(process.env.SECRET_KEY);

export const verifyJWT = async (req: Request, res: Response, next: NextFunction) => {
    const access_token = req.cookies.access_token;

    try {
        const { payload }: { payload: { userId: string }} = await jwtVerify(access_token, secret, {
            algorithms: ["HS256"]
        })

        
        const user = await prisma.user.findUnique({
            where: {
                id: payload.userId
            }
        })
        
        if(!user) {
            return sendError(404, "User not found", res)
        }

        req.user = user;
        next();
    } catch(error) {
        // default internal server error
        let status = 500;
        let message = "Internal server error";

        if(error instanceof errors.JWTExpired) {
            status = 401
            message = "Token expired"
        } else if(error instanceof errors.JWSSignatureVerificationFailed) {
            status = 401;
            message = "Invalid token"
        }

        return sendError(status, message, res)
    }
}