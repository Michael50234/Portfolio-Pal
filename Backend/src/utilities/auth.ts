import bcrypt from "bcrypt"
import { SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.SECRET_KEY);

export const createJWT = (userId: string) => {
    return new SignJWT({
        userId: userId
    }).setProtectedHeader({alg: "HS256"})
    .setIssuedAt()
    .setExpirationTime("30m")
    .sign(secret)
}

export const checkPassword = (password: string, hashedPassword: string) => {
    return bcrypt.compare(password, hashedPassword);
}

export const hashPassword = (password: string) => {
    return bcrypt.hash(password, 10);
}