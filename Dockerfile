# Deno 2.4.0 + fcm has some beef with docker
FROM denoland/deno:2.5.1

WORKDIR /app

# Way faster builds
COPY --chown=deno:deno . .

USER deno

EXPOSE 8000

CMD ["deno", "run", "dev"]