import z from "zod";

export const updatePasswordSchema = z.object({
    newPassword: z.string().min(1),
    oldPassword: z.string().min(1)
});

export const deleteAccountSchema = z.object({
    username: z.string().trim().min(1),
    password: z.string().min(1)
});