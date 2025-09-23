import { Queue } from "bullmq";
import { connection } from "./exports.ts";

export const queue = new Queue("fcm-queue", { connection });

export const sendToMessageQueue = async (
  title: string,
  message: string,
  tokens: string[],
) => await queue.add("fcm-message", { title, message, tokens });
