# EduBari website

Next.js 16 (App Router) + PostgreSQL. Public website, admin panel, School ERP subscription billing
(bKash / Nagad / manual) and AI credit sales.

## Local development

```bash
cp .env.example .env        # fill in PG* (or DATABASE_URL), ADMIN_SESSION_SECRET, ...
npm install
npm run db:migrate          # create / update the schema
SEED_ADMIN_EMAIL=you@example.com SEED_ADMIN_PASSWORD='a long password' npm run db:seed
npm run dev
```

## Database

| Command | What it does |
|---|---|
| `npm run db:migrate` | Applies pending `migrations/NNNN_name.sql` files (each in its own transaction, under a lock). Runs automatically when the Docker container starts. |
| `npm run db:status` | Lists applied / pending migrations. |
| `npm run db:seed` | Default plans, AI packages, sample blog posts, and the first admin (from `SEED_ADMIN_*`). Never overwrites existing rows. |
| `npm run db:backup` | `pg_dump` to `backups/` (needs the PostgreSQL client tools). |
| `npm run admin:reset -- --email you@example.com` | Create an admin or set a new password (prompted, or `ADMIN_NEW_PASSWORD`). |
| `npm run admin:unlock` | Clear the failed-login rate limit. |
| `npm run db:import-mysql` | One-time copy of the old MySQL data (see below). |

**Changing the schema:** add a new file such as `migrations/0002_add_invoice_notes.sql`. Never edit a
migration that has already been applied: the runner stores each file's checksum and stops if an
applied file changes.

Code uses `lib/db.js`: `query`, `queryOne`, `execute` with `?` placeholders, and
`withTransaction(async (tx) => ...)` for anything that must happen all-or-nothing (subscriptions,
payments, credits). Database errors are thrown, never swallowed.

## Moving production from MySQL to PostgreSQL (one time)

1. **Back up MySQL.** Example: `mysqldump --single-transaction edubari > mysql-backup.sql`.
2. In `.env`, add `PGUSER`, `PGPASSWORD` and `PGDATABASE`. Move the old `DB_*` values to the `MYSQL_*` variables.
3. Start PostgreSQL: `docker compose up -d db`.
4. **Dry run** (writes nothing). Read the report: row counts, data fixes, and any columns it could not place.
   ```bash
   docker compose run --rm web node scripts/migrate-mysql-to-postgres.js
   ```
5. **Import.** Everything goes in one transaction, and the script checks that row counts match before it commits.
   ```bash
   docker compose run --rm web node scripts/migrate-mysql-to-postgres.js --commit
   ```
6. `docker compose up -d --build web`. Then check the admin panel, `/check-subscription`, and one ERP `verify-domain` call.
7. Keep MySQL read-only for a while as a fallback. After that, delete the `MYSQL_*` lines from `.env`.

> `MYSQL_TIMEZONE` must match the time zone the old app wrote dates in. The default is UTC (`Z`), which is what the old Docker container used. If it ran on Bangladesh time, use `+06:00`.

The old MySQL schema and scripts are kept for reference in `legacy/mysql/`. Nothing runs them.
