import type { Response } from "express"

// Function for centralized error response
const sendError = (status: number, message: string, res: Response) => {
    return res.status(status).json({
        message: message
    })
}

export default sendError;