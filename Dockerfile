FROM denoland/deno:2.4.0

WORKDIR /app

# Prefer not to run as root.
USER deno

# Seperate depenencies into a different layer so that they can be cached.
COPY deno.lock deno.json ./
RUN deno install

# These steps will be re-run upon each file change in your working directory:
COPY . .
# Compile the main app so that it doesn't need to be compiled each startup/entry.
RUN deno cache main.ts

EXPOSE 8000

CMD ["deno", "run", "dev"]
