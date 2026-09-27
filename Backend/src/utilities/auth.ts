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