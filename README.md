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

## API Endpoints

All requests to the following endpoints should include a valid JWT in the
`Authorization` header.

```
Authorization: Bearer <JWT>
```

### User

| Method | Route   | Description          |
| ------ | ------- | -------------------- |
| `GET`  | `/user` | Get the current user |
| `POST` | `/user` | Create a new user    |

### Rides

| Method   | Route                            | Description                           |
| -------- | -------------------------------- | ------------------------------------- |
| `GET`    | `/rides/search`                  | Search rides                          |
| `GET`    | `/rides/:rideId`                 | Get a specific ride by ID             |
| `POST`   | `/rides`                         | Create a new ride                     |
| `POST`   | `/rides/manage/requests/:rideId` | Accept/Deny ride request              |
| `PUT`    | `/rides/manage/update/:rideId`   | Update a ride                         |
| `DELETE` | `/rides/manage/dismiss/:rideId`  | Remove a user from a ride             |
| `DELETE` | `/rides/manage/delete/:rideId`   | Delete a ride                         |
| `GET`    | `/rides/requests`                | Get all requests for the current user |
| `POST`   | `/rides/request/:rideId`         | Create a ride request                 |
| `DELETE` | `/rides/request/:rideId`         | Cancel a ride request                 |
| `POST`   | `/rides/exit/:rideId`            | Leave a ride                          |

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
