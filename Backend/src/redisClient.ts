import { createClient } from "redis";
import "dotenv/config";

const redisClient = createClient({
    url: process.env.REDIS_DATABASE_URL!
})

redisClient.on("error", (err) => console.error("Redis error:", err));

export default redisClient;