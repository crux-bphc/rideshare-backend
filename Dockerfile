FROM denoland/deno:2.4.0

WORKDIR /app

# Root user by default — copy files
COPY . .
RUN chown -R deno:deno /app

USER deno

EXPOSE 8000

CMD ["deno", "run", "dev"]