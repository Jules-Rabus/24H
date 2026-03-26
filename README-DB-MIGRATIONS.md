# Database Migrations to run locally

To apply the changes made to the database schema (creation of the `RaceMedia` entity), please run the following commands in your local development environment:

```bash
# Generate the migration file based on the new RaceMedia entity
docker compose exec php bin/console make:migration

# Apply the migration to the database
docker compose exec php bin/console doctrine:migrations:migrate -n
```
