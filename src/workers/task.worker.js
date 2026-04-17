// import { Worker } from "bullmq";
// import IORedis from "ioredis";
// import Task from "../model/task.model.js";
// console.log("🚀 Worker started...");

// const connection = new IORedis({
//     host: "127.0.0.1",
//     port: 6379,
//     maxRetriesPerRequest: null,
// });
// const worker = new Worker(
//     "task-queue",
//     async (job) => {
//         const { taskId } = job.data;

//         const task = await Task.findById(taskId);

//         if (!task) throw new Error("Task not found");

//         task.status = "running";
//         task.logs.push({ message: "Task started" });
//         await task.save();

//         try {
//             let result = "";

//             if (task.operation === "summarize") {
//                 result = task.inputText.slice(0, 50) + "...";
//             } else if (task.operation === "translate") {
//                 result = "Translated: " + task.inputText;
//             } else if (task.operation === "analyze") {
//                 result = "Analysis complete";
//             }

//             // Success
//             task.status = "success";
//             task.result = result;
//             task.logs.push({ message: "Task completed" });

//             await task.save();
//         } catch (err) {
//             task.status = "failed";
//             task.error = err.message;
//             task.logs.push({ message: "Task failed" });

//             await task.save();
//         }
//     },
//     { connection }
// );

// export default worker;


import { Worker } from "bullmq";
import { connection } from "./connection.js";
import Task from "../model/task.model.js";

console.log("🚀 Worker started...");

const worker = new Worker(
  "task-queue",
  async (job) => {
    const { taskId } = job.data;

    const task = await Task.findById(taskId);
    if (!task) throw new Error("Task not found");

    task.status = "running";
    task.logs.push({ message: "Task started" });
    await task.save();

    // Let errors bubble up — BullMQ will mark the job as failed
    let result = "";
    if (task.operation === "summarize") {
      result = task.inputText.slice(0, 50) + "...";
    } else if (task.operation === "translate") {
      result = "Translated: " + task.inputText;
    } else if (task.operation === "analyze") {
      result = "Analysis complete";
    } else {
      throw new Error(`Unknown operation: ${task.operation}`);
    }

    task.status = "success";
    task.result = result;
    task.logs.push({ message: "Task completed" });
    await task.save();
  },
  { connection }
);

// Handle worker-level errors (e.g., Redis issues)
worker.on("error", (err) => {
  console.error("Worker error:", err);
});

// Listen to BullMQ's failed event to sync DB status
worker.on("failed", async (job, err) => {
  if (!job) return;
  const task = await Task.findById(job.data.taskId);
  if (task) {
    task.status = "failed";
    task.error = err.message;
    task.logs.push({ message: "Task failed" });
    await task.save();
  }
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  await worker.close();
});

export default worker;