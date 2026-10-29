#!/usr/bin/env bash
# Runs ON THE SERVER, called by .github/workflows/deploy.yml over SSH.
#   remote-deploy.sh migrate   apply prisma/schema.prisma to the database (stops on data loss)
#   remote-deploy.sh restart   restart the Node.js app (Passenger)
#   remote-deploy.sh import <file.sql>   one-time data import (copy-neon-data workflow)
# Lives in <app dir>/_deploy/. Secrets come from <app dir>/.env, which you create once in cPanel.
set -euo pipefail

DEPLOY_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$(dirname "$DEPLOY_DIR")"
cd "$APP_DIR"

fail() { echo "::error::$*" >&2; exit 1; }

load_env() {
  [ -f "$APP_DIR/.env" ] || fail "Missing $APP_DIR/.env. Create it in cPanel File Manager (see docs/DEPLOY.md, step 4)."
  set -a
  # Strip Windows line endings (the file is usually edited in cPanel from a Windows PC).
  # shellcheck disable=SC1090
  . <(tr -d '\r' < "$APP_DIR/.env")
  set +a
  [ -n "${DATABASE_URL:-}" ] || fail "DATABASE_URL is not set in $APP_DIR/.env"
}

use_node() {
  # cPanel "Setup Node.js App" keeps Node in ~/nodevenv/<app path>/<version>/bin
  local rel="${APP_DIR#"$HOME"/}"
  local activate
  activate="$(ls -d "$HOME/nodevenv/$rel"/*/bin/activate 2>/dev/null | sort -V | tail -n 1 || true)"
  if [ -n "$activate" ]; then
    # shellcheck disable=SC1090
    set +u; . "$activate"; set -u
  fi
  command -v node >/dev/null || fail "Node.js not found. Create the app in cPanel → Setup Node.js App first (docs/DEPLOY.md, step 3)."
  echo "Using node $(node -v)"
}

case "${1:-}" in
  migrate)
    load_env
    use_node
    cd "$DEPLOY_DIR/migrate"
    # Reinstall the Prisma CLI only when its version changes.
    sum="$(md5sum package.json | cut -d' ' -f1)"
    if [ ! -d node_modules/prisma ] || [ "$(cat .installed 2>/dev/null)" != "$sum" ]; then
      npm install --no-audit --no-fund --loglevel=error
      echo "$sum" > .installed
    fi
    # Without --accept-data-loss, prisma refuses changes that would drop data, and the deploy stops
    # before any new code goes live.
    npx prisma db push --skip-generate --schema schema.prisma
    ;;
  restart)
    mkdir -p "$APP_DIR/tmp"
    touch "$APP_DIR/tmp/restart.txt"
    echo "Restart requested"
    ;;
  import)
    load_env
    file="${2:-}"
    [ -f "$file" ] || fail "No dump file given"
    command -v psql >/dev/null || fail "psql is not available on this server. Import the file with cPanel → phpPgAdmin instead."
    url="${DATABASE_URL%%\?*}" # psql doesn't understand Prisma's ?connection_limit=… options
    count="$(psql "$url" -tAc 'SELECT count(*) FROM "AdminUser"')"
    [ "$count" = "0" ] || fail "The server database already has data (AdminUser rows: $count). Import stopped so nothing is overwritten."
    psql "$url" -v ON_ERROR_STOP=1 --single-transaction -q -f "$file"
    rm -f "$file"
    echo "Data imported"
    ;;
  *)
    fail "usage: remote-deploy.sh migrate|restart|import <file>"
    ;;
esac
