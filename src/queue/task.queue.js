import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis({
    host: "127.0.0.1",
    port: 6380,
});
// Add these lines
connection.on("connect", () => {
    console.log("Redis connected (Queue)");
});

connection.on("error", (err) => {
    console.log("Redis error:", err);
});
export const taskQueue = new Queue("task-queue", {
    connection,
});
