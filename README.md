```
cp .env.example .env
docker compose --profile dev up --build --watch
docker compose exec web-dev deno run db migrate
```
