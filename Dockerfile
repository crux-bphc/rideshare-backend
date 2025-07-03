FROM denoland/deno:2.4.0

WORKDIR /app

# Root user by default — copy files
COPY deno.json deno.lock ./
RUN chown deno:deno deno.json deno.lock

USER deno

COPY . .

EXPOSE 8000

CMD ["deno", "run", "--allow-net", "--allow-env", "--allow-read", "src/app.ts"]