import { Queue } from "bullmq";

const connection = {
  host: Deno.env.get("REDIS_HOST") ?? "redis",
  port: parseInt(Deno.env.get("REDIS_PORT") ?? "6379"),
  password: Deno.env.get("REDIS_PASSWORD") ?? "",
};

export const queue = new Queue("fcm-queue", { connection });

export const sendToMessageQueue = async (
  title: string,
  message: string,
  tokens: string[],
) => await queue.add("fcm-message", { title, message, tokens });
