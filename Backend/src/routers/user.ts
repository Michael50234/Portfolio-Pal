import bcrypt from "bcrypt";
import express from "express"

import { prisma } from "../prismaClient";
import { deleteAccountSchema, updatePasswordSchema } from "../validation/userSchemas";
import sendError from "../utilities/error";
import { getUserById } from "../utilities/user";
import { checkPassword, hashPassword } from "../utilities/auth";

export const userRouter = express.Router();

// Delete user's account
userRouter.delete('/', async (req, res) => {
    const user = req.user!;
    const parsed = deleteAccountSchema.safeParse(req.body);

    if(!parsed.success) {
        return sendError(400, "Bad Request", res);
    }

    const { username, password } = parsed.data;

    try {
        const userRecord = await getUserById(user.userId);
        if(!userRecord) {
            return sendError(401, "Not authorized", res);
        }

        if((username == user.username) && (await checkPassword(password, userRecord.password))) {
            await prisma.user.delete({
                where: {
                    id: user.userId
                }
            });

            res.clearCookie('access_token', {
                httpOnly: true,
                secure: true,
                sameSite: "lax", 
                maxAge: 1000 * 60 * 30,
                path: "/"
            });

            return res.status(200).json({
                message: "Successfully deleted account"
            });
        } else {
            return sendError(401, "Not authorized", res);
        }
    } catch (error) {
        console.error("DELETE /user failed:", error);
        return sendError(500, "Internal server error", res);
    }
})

// Update password
userRouter.patch('/password', async (req, res) => {
    const user = req.user!;
    const parsed = updatePasswordSchema.safeParse(req.body)

    if(!parsed.success) {
        return sendError(400, "Bad request", res);
    }

    const { oldPassword, newPassword } = parsed.data;
    try {
        const userRecord = await getUserById(user.userId);
        if(!userRecord) {
            return sendError(401, "Not authorized", res);
        }

        if(await checkPassword(oldPassword, userRecord.password)) {
            const newHashedPassword = await hashPassword(newPassword)

            await prisma.user.update({
                where: {
                    id: user.userId
                },
                data: {
                    password: newHashedPassword,
                }
            });

            return res.status(200).json({
                "message": "Successfully updated password"
            })
        } else {
            return sendError(401, "Not authorized", res);
        }
    } catch (error) {
        console.error("PATCH /user/password failed:", error);
        return sendError(500, "Internal server error", res);
    }
})
