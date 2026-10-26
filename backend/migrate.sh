#!/usr/bin/env bash

# Stop on errors, unset variables, and failed pipelines.
set -euo pipefail

# Suppress harmless PostgreSQL NOTICE messages.
export PGOPTIONS="-c client_min_messages=warning"

# Load environment variables from .env.
set -a
source .env
set +a

# Require DATABASE_URL.
: "${DATABASE_URL:?Missing required setting DATABASE_URL in .env}"

# Create the migration history table (no variables here, so -c is fine).
psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -q -c "
CREATE TABLE IF NOT EXISTS schema_migrations (
    filename   TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
"

# Find migration files in filename order.
shopt -s nullglob
files=(migrations/*.sql)

# Stop if no migration files exist.
if ((${#files[@]} == 0)); then
    echo "No migration files found in migrations/."
    exit 0
fi

for file in "${files[@]}"; do
    name=$(basename "$file")

    # Check whether this migration has already been applied.
    # SQL goes in via stdin so psql interpolates :'filename'.
    already=$(psql "$DATABASE_URL" \
        -X -tA -v ON_ERROR_STOP=1 \
        -v "filename=$name" <<'SQL'
SELECT 1 FROM schema_migrations WHERE filename = :'filename';
SQL
    )

    if [[ "$already" == "1" ]]; then
        echo "skip   $name"
        continue
    fi

    # Apply the migration and record it atomically.
    # Everything is piped through stdin so :'filename' is interpolated,
    # and --single-transaction wraps it all in one BEGIN/COMMIT.
    {
        cat "$file"
        echo
        echo "INSERT INTO schema_migrations (filename) VALUES (:'filename');"
    } | psql "$DATABASE_URL" \
        -X -v ON_ERROR_STOP=1 -q \
        --single-transaction \
        -v "filename=$name"

    echo "apply  $name"
done

echo "Migration process completed."