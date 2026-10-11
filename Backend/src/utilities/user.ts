import { prisma } from "../prismaClient";


export function getUserById(id: string) {
    return prisma.user.findUnique({
        where: {
            id: id
        }
    })
}