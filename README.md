# Rideshare backend

Cab sharing platform made with Deno, Express, and PostgreSQL.

## Running

1. Make a .env file from the example:

```
cp .env.example .env
```

Note: If you're running `drizzle-kit` outside docker, change this to `localhost`

2. Use Docker to run the watcher

```
docker compose --profile dev up --build --watch
```

3. To migrate the database, run

```
docker compose exec web-dev deno run db migrate
```

## Database

The schema is located in `src/db/schema/tables.ts`. The database is managed
using [Drizzle ORM](https://orm.drizzle.team/).

- To generate migration files, run:

```
deno run db generate
```

Note: When running db commands outside of Docker, you may need to set the
`PGHOST` environment variable to `localhost`.

- To apply migrations, run:

```
deno run db migrate
```
