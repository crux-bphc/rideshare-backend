import process from "node:process";
export const connection = {
  host: process.env.REDIS_HOST ?? "redis",
  port: parseInt(process.env.REDIS_PORT ?? "6379"),
  password: process.env.REDIS_PASSWORD ?? "",
};

const internalStartFCMQueue = () => {
  const start_queue = new Deno.Command("deno", {
    args: [
      "--allow-read",
      "--allow-net",
      "--allow-env",
      "./src/bullmq/worker.ts", // spawned with absolute paths
    ],
    stdout: "piped",
    stderr: "piped",
  });

  const child = start_queue.spawn();

  // Show output in the app stream
  child.stdout.pipeTo(
    new WritableStream({
      write(chunk) {
        const text = new TextDecoder().decode(chunk);
        console.log("[Message Send Output]:", text);
      },
    }),
  );
  child.stderr.pipeTo(
    new WritableStream({
      write(chunk) {
        const text = new TextDecoder().decode(chunk);
        console.log("[Message Send Error]:", text);
      },
    }),
  );
  return child;
};

export const startFCMQueue = async () => {
  const status = await internalStartFCMQueue().status;

  if (status.code !== 0) {
    console.log(
      "FCM Queue processs exited unexpectedly! Attempting to restart",
    );
    await startFCMQueue();
  }
};
