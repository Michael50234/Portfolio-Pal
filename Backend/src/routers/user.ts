import bcrypt from "bcrypt";
import express from "express"

import { prisma } from "../prismaClient";
import { deleteAccountSchema, updatePasswordSchema } from "../validation/userSchemas";
import sendError from "../utilities/error";


export const userRouter = express.Router();

// Delete user's account
userRouter.delete('', async (req, res) => {
    const user = req.user;
    const parsed = deleteAccountSchema.safeParse(req.body);

    if(!parsed.success) {
        return sendError(400, "Bad Request", res);
    }

    const { username, password } = parsed.data;

    try {
        if((username == user.username) && (await bcrypt.compare(password, user.password))) {
            await prisma.user.delete({
                where: {
                    id: user.id
                }
            });

            return res.status(200).json({
                message: "Successfully deleted account"
            });
        } else {
            return sendError(400, "Bad request", res);
        };
    } catch {
        return sendError(500, "Internal server error", res);
    }
})

// Update password
userRouter.patch('/password', async (req, res) => {
    const user = req.user;
    const parsed = updatePasswordSchema.safeParse(req.body)

    if(!parsed.success) {
        return sendError(500, "Bad request", res);
    }

    const { oldPassword, newPassword } = parsed.data;
    try {
        if(await bcrypt.compare(oldPassword, user.password)) {
            const newHashedPassword = await bcrypt.hash(newPassword, 10);

            await prisma.user.update({
                where: {
                    id: user.id
                },
                data: {
                    password: newHashedPassword,
                }
            });

            return res.status(200).json({
                "message": "Successfully updated password"
            })
        } else {
            return sendError(400, "Bad request", res);
        }        
    } catch {
        return sendError(500, "Internal server error", res);
    }
})
