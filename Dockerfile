# Deno 2.4.0 + fcm has some beef with docker
FROM denoland/deno:2.5.1

WORKDIR /app

# Root user by default — copy files
COPY . .
RUN chown -R deno:deno /app

USER deno

EXPOSE 8000

CMD ["deno", "run", "dev"]