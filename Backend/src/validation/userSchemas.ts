import z from "zod";

export const updatePasswordSchema = z.object({
    newPassword: z.string().trim().min(1),
    oldPassword: z.string().trim().min(1)
});

export const deleteAccountSchema = z.object({
    username: z.string().trim().min(1),
    password: z.string().trim().min(1)
});