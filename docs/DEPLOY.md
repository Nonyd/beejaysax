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

### 2. (If needed) Check SSH is on

cPanel → **Security → SSH Access**. Namecheap shared hosting allows SSH on port **21098**.

### 3. Create the Node.js app

cPanel → **Software → Setup Node.js App → Create application**

| Field | Value |
|---|---|
| Node.js version | **20.x** (or 22.x). Must be 20.9 or newer. |
| Application mode | Production |
| Application root | `beejaysax` (this becomes `/home/beejebrk/beejaysax`) |
| Application URL | `beejaysax.com` |
| Application startup file | `server.js` |

Click **Create**. Don't click "Run NPM install"; the deploy uploads everything the app needs.
You can leave the environment variables in this screen empty: the app reads them from `.env` (next step).

> The Node.js app takes over the whole domain. Anything previously in `public_html` stops being served.

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

Generate the two secrets with any password generator (40+ letters and numbers), or in a terminal:
`openssl rand -base64 32`.

Then set the file's permissions to **600** (File Manager → right-click → Change Permissions), so only your
account can read it. The deploy never overwrites this file.

Everything else (Paystack, Resend, Brevo, Spotify, YouTube, jobs token) is set in **Admin → Settings** once the
site is running.

### 5. Create the deploy key

cPanel → **Security → SSH Access → Manage SSH Keys → Generate a New Key**

- Key name: `github_deploy`, **no passphrase** (leave both password fields empty), type RSA 4096.
- Back in the key list, click **Manage** next to `github_deploy` → **Authorize**.
- Click **View/Download** on the *private* key and copy the whole text (from `-----BEGIN` to `-----END…KEY-----`).

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
| `NEON_DIRECT_URL` | Neon's *direct* connection string (Neon dashboard → Connection details, pooling **off**). Only used once, in step 8. |

**Variables** (tab "Variables" → New repository variable):

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://beejaysax.com` |
| `DEPLOY_ENABLED` | `true` (this switches automatic deploys on) |

### 7. First deploy

GitHub → **Actions → Deploy to cPanel → Run workflow** (on `master`). This creates the database tables and
starts the site. When it's green, https://beejaysax.com/api/health shows `"db":true`.

### 8. Copy the existing data from Neon (once)

GitHub → **Actions → Copy data from Neon to the server (one-time) → Run workflow**, type `COPY`.

It copies events, tickets, orders, releases, videos, website content, messages and the admin login. It refuses to
run if the server database already has data, so it can't overwrite anything.

If it says `psql is not available`, use the manual route: cPanel → **phpPgAdmin** → your database → **SQL** →
upload a data-only dump (ask for one and it can be generated from Neon).

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
