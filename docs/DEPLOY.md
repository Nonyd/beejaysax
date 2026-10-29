# Deploying beejaysax.com to the cPanel server

After the one-time setup below, **every push to `master` deploys automatically**:

1. GitHub builds the site (the server never has to build, which shared hosting can't do reliably).
2. Database changes in `prisma/schema.prisma` are applied on the server. If a change would delete data, the
   deploy stops here and the live site is untouched.
3. The new files are uploaded, the app restarts, and the workflow checks the live site is on the new version.

It takes about 5 minutes. Watch it under **GitHub → Actions → Deploy to cPanel**.

The workflow is `.github/workflows/deploy.yml`; the server side is `deploy/remote-deploy.sh`.

---

## One-time setup (about 30 minutes)

Values below use this account: cPanel user **beejebrk**, server **162.0.209.225**. Namecheap's SSH port is **21098**.

### 1. Create the database

cPanel → **Databases → PostgreSQL Database Wizard**

1. Database name: `beejaysax` (cPanel makes it `beejebrk_beejaysax`).
2. Create a user, e.g. `app` (becomes `beejebrk_app`), with a long generated password. Save the password.
3. Give the user **all privileges** on the database.

Your connection string is:

```
postgresql://beejebrk_app:PASSWORD@localhost:5432/beejebrk_beejaysax?connection_limit=5
```

If the password has symbols like `@ : / ? # %`, replace them with their URL codes (`@` → `%40`, `#` → `%23`,
`%` → `%25`, `/` → `%2F`, `:` → `%3A`, `?` → `%3F`) or generate a password with only letters and numbers.

### 2. Turn SSH on

cPanel → **Manage Shell** (or **Security → SSH Access**) → switch **Enable SSH access** on. Port **21098**.
Without this the server accepts the key but replies "Shell access is not enabled on your account".

### 3. Create the Node.js app

cPanel → **Software → Setup Node.js App → Create application**

| Field | Value |
|---|---|
| Node.js version | **22.x** (the build also runs on Node 22) |
| Application mode | Production |
| Application root | `beejaysax` (this becomes `/home/beejebrk/beejaysax`) |
| Application URL | `beejaysax.com` |
| Application startup file | `server.js` |

Click **Create**. Don't click "Run NPM install"; the deploy uploads everything the app needs.
You can leave the environment variables in this screen empty: the app reads them from `.env` (next step).

> The domain's `public_html/.htaccess` must contain only the CloudLinux Passenger blocks that cPanel adds.
> Old WordPress/LiteSpeed rewrite rules in that file send every request to WordPress instead of the app
> (the original was kept as `public_html/.htaccess.wordpress-backup`). Files left in `public_html` can still be
> opened directly by their exact path, so move old sites out of it.

### 4. Create the server's `.env` file

cPanel → **File Manager** → open `/home/beejebrk/beejaysax` → **+ File** → name it `.env` → **Edit**, paste,
and fill in the values:

```bash
# Database (from step 1)
DATABASE_URL="postgresql://beejebrk_app:PASSWORD@localhost:5432/beejebrk_beejaysax?connection_limit=5"
DIRECT_URL="postgresql://beejebrk_app:PASSWORD@localhost:5432/beejebrk_beejaysax"

# Site
NEXT_PUBLIC_SITE_URL="https://beejaysax.com"
NEXTAUTH_URL="https://beejaysax.com"
SITE_TIMEZONE="Africa/Lagos"

# Login sessions. Long random string.
NEXTAUTH_SECRET="…"
# Encrypts payment/email keys saved in Admin → Settings. Long random string. Never change it later.
SETTINGS_ENCRYPTION_KEY="…"
```

Photos uploaded in the admin are saved on the server in `/home/beejebrk/beejaysax/uploads` and served from
`https://beejaysax.com/uploads/…`. Deploys never touch that folder. Include it in your cPanel backups.

Generate each secret in PowerShell (run it twice, one value per secret):
`$b = New-Object byte[] 32; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b); ($b | % { $_.ToString('x2') }) -join ''`

The first deploy adds one line, `PRISMA_QUERY_ENGINE_LIBRARY=…`, to this file. Leave it in: it tells the app which
database engine fits this server.

Then set the file's permissions to **600** (File Manager → right-click → Change Permissions), so only your
account can read it. The deploy never overwrites this file.

Everything else (Paystack, Resend, Brevo, Spotify, YouTube, jobs token) is set in **Admin → Settings** once the
site is running.

### 5. Create the deploy key

This cPanel won't generate a key without a passphrase, so make it on your PC and import only the public half.

1. PowerShell: `ssh-keygen -t rsa -b 4096 -m PEM -C "github-deploy-beejaysax" -f "$HOME.ssheejaysax_deploy"`
   and press Enter twice for no passphrase.
2. `Get-Content "$HOME.ssheejaysax_deploy.pub" | Set-Clipboard` → cPanel → **SSH Access → Manage SSH Keys →
   Import Key** → name `github_deploy`, paste into **Public key** only → Import.
3. **Manage** next to `github_deploy` → **Authorize**.
4. `Get-Content "$HOME.ssheejaysax_deploy" -Raw | Set-Clipboard` → that is the `SSH_KEY` secret (next step).

### 6. Add the GitHub secrets and variables

GitHub → repository **Settings → Secrets and variables → Actions**.

**Secrets** (tab "Secrets" → New repository secret):

| Name | Value |
|---|---|
| `SSH_HOST` | `162.0.209.225` |
| `SSH_PORT` | `21098` |
| `SSH_USER` | `beejebrk` |
| `SSH_KEY` | the private key from step 5 |
| `APP_DIR` | `/home/beejebrk/beejaysax` |

**Variables** (tab "Variables" → New repository variable):

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://beejaysax.com` (a secret with this name works too) |
| `DEPLOY_ENABLED` | `true` (this switches automatic deploys on) |

### 7. First deploy

GitHub → **Actions → Deploy to cPanel → Run workflow** (on `master`). This creates the database tables and
starts the site. When it's green, https://beejaysax.com/api/health shows `"db":true`.

### 8. Existing data (done 29 Oct 2026)

The data from the old Neon staging database (admin login, events, tiers, tickets, releases, videos, settings) was
copied into the server database once. The server runs PostgreSQL 10 and blocks SSH tunnels, so it was exported
to JSON with Prisma and imported on the server with the app's own Prisma client. Neon is no longer used.

### 9. Turn on scheduled jobs (reminders, email retries, seat release)

1. Admin → **Settings → Scheduled jobs**: set a long random token and save.
2. cPanel → **Advanced → Cron Jobs** → Add New Cron Job → **Every 15 minutes** (`*/15 * * * *`), command:

   ```
   curl -fsS -H "Authorization: Bearer YOUR_TOKEN" https://beejaysax.com/api/jobs/run > /dev/null
   ```

Admin → Settings shows when the jobs last ran.

### 10. Point the webhooks at the server

If the webhook URLs in Paystack, Resend and Brevo already use `https://beejaysax.com`, nothing changes.
Otherwise copy the URLs shown in Admin → Settings into each dashboard.

### 11. Vercel

Vercel will keep deploying `master` to beejaysax.vercel.app with the **Neon** database, which no longer matches the
server. Disconnect the Vercel project (Vercel → Project → Settings → Git → Disconnect), or point it at a separate
`staging` branch if you want to keep a staging copy.

---

## Day to day

- **Deploy:** push to `master`. Nothing else.
- **See what's live:** https://beejaysax.com/api/health shows the deployed commit.
- **Roll back:** revert the commit and push, or open an older successful run in Actions and click **Re-run all jobs**.
  Code rolls back; database changes don't (they are only ever additive unless you remove a field).
- **Manual deploy:** Actions → Deploy to cPanel → Run workflow.

## When something goes wrong

| What you see | What to do |
|---|---|
| Deploy fails at "Check configuration" | A secret or variable from step 6 is missing; the message names it. |
| Fails at "Update database schema" with *data loss* | A schema change would delete data. Nothing went live. Change the schema to keep the data, or migrate it deliberately. |
| `Missing /home/beejebrk/beejaysax/.env` | Do step 4. |
| `Node.js not found` | Do step 3. |
| Fails at "Check the new version is live" | cPanel → Setup Node.js App → **Restart**; read `/home/beejebrk/beejaysax/stderr.log` in File Manager. |
| `Permission denied (publickey)` | The key in step 5 isn't **Authorized**, or `SSH_KEY` is incomplete. |
| Site shows "Incomplete response" / 503 | Usually the database: check `DATABASE_URL` in `.env`, then Restart the app. |

## How it fits together

```
git push ──▶ GitHub Actions (ubuntu)
             ├─ npm ci, prisma generate, next build (output: standalone)
             ├─ rsync schema + Prisma CLI ──▶ ~/beejaysax/_deploy ──▶ prisma db push   (stops on data loss)
             ├─ rsync app bundle ─────────▶ ~/beejaysax            (keeps .env, uploads/, tmp/, logs)
             ├─ touch tmp/restart.txt ───▶ Passenger restarts node server.js
             └─ curl /api/health until it reports the new commit
```
