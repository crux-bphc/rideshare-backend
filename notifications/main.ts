import { Worker } from "bullmq";
import { sendMessage } from "./notifications.ts";

const connection = {
    host: process.env.REDIS_HOST ?? "redis",
    port: parseInt(process.env.REDIS_PORT ?? "6379"),
    password: process.env.REDIS_PASSWORD ?? "",
};

const worker = new Worker("fcm-queue", async (job) => {
    const { data } = job;
    const { tokens, title, message } = data;

    console.log("Sending: ", { title, message });
    await sendMessage(title, message, tokens);
}, { connection });

worker.on("completed", (job) => {
    console.log(`Sent message ${job.id}`);
});

worker.on("failed", (job, err) => {
    console.error(`Send ${job?.id} failed:`, err.message);
});

console.log("FCM Queue started");
