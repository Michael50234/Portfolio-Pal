import type { User } from "../generated/prisma/models/User";

declare global {
    namespace Express {
        interface Request {
            user?: User;
        }
    }
}

export {};
