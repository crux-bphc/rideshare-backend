# Rideshare backend

Cab sharing platform made with Deno, Express, and PostgreSQL.

## Running

1. Make a .env file from the example:

```
cp .env.example .env
```

Note: If you're running `drizzle-kit` outside docker, change this to `localhost`

2. Aquire the service account private key through Google cloud console:
   - https://console.cloud.google.com/iam-admin/serviceaccounts, create a
     project if not already created
   - Then go to: Actions > Manage Keys > Add Key
   - Download the JSON file
   - Put it in the notifications folder and point its path to GOOGLE_APPLICATION_CREDENTIALS relative to this folder

3. Use Docker to run the watcher

```
docker compose --profile dev up --build --watch
```

4. To migrate the database, run

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
