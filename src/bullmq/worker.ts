// worker.ts
import { Worker } from "bullmq";
import { sendMessage } from "../utils/notifications.ts";
import { connection } from "./exports.ts";

const worker = new Worker("fcm-queue", async (job) => {
  const { data } = job;
  const { tokens, title, message } = data;

  console.log("Sending: ", { title, message });
  const result = await sendMessage(title, message, tokens);

  return result;
}, { connection });

worker.on("completed", (job) => {
  console.log(`Sent message ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`Send ${job?.id} failed:`, err.message);
});

console.log("FCM Queue started");
