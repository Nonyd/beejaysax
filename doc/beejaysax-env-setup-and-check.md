# 🎷 BEEJAY SAX — Fix ENV Files + Run All Checks
## Cursor AI Prompt — Paste this entire file into Cursor Chat

---

## YOUR JOB

Do everything in this prompt from top to bottom without stopping.
Do not ask for confirmation. Do not explain. Just do it.

---

## STEP 1 — Create the `.env` file

Create or completely replace the file `.env` in the project root with exactly this content:

```env
# Neon PostgreSQL — Database
DATABASE_URL="postgresql://neondb_owner:REPLACE_WITH_NEW_NEON_PASSWORD@ep-winter-dust-abhrtbiq-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://neondb_owner:REPLACE_WITH_NEW_NEON_PASSWORD@ep-winter-dust-abhrtbiq.eu-west-2.aws.neon.tech/neondb?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="REPLACE_WITH_GENERATED_SECRET"
NEXTAUTH_URL="http://localhost:3000"

# Cloudinary
CLOUDINARY_CLOUD_NAME="REPLACE_WITH_YOUR_CLOUD_NAME"
CLOUDINARY_API_KEY="323675366511268"
CLOUDINARY_API_SECRET="REPLACE_WITH_NEW_CLOUDINARY_SECRET"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="REPLACE_WITH_YOUR_CLOUD_NAME"

# Resend — Email
RESEND_API_KEY="REPLACE_WITH_RESEND_API_KEY"
EMAIL_FROM="tickets@beejaysax.com"
ADMIN_EMAIL="admin@beejaysax.com"

# Ticket Verification
ADMIN_VERIFY_KEY="REPLACE_WITH_GENERATED_KEY"
NEXT_PUBLIC_ADMIN_VERIFY_KEY="REPLACE_WITH_SAME_GENERATED_KEY"

# Site URL
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

---

## STEP 2 — Create the `.env.local` file

Create or completely replace the file `.env.local` in the project root with exactly the same content as `.env` above. Both files must be identical.

---

## STEP 3 — Generate secrets and fill them in

Run these two commands in the terminal and use the outputs to fill in the placeholder values:

```bash
# Run this — output goes into NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Run this — output goes into ADMIN_VERIFY_KEY and NEXT_PUBLIC_ADMIN_VERIFY_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Replace `REPLACE_WITH_GENERATED_SECRET` with the first output.
Replace both `REPLACE_WITH_GENERATED_KEY` instances with the second output.

Update BOTH `.env` and `.env.local` with these generated values.

---

## STEP 4 — Ask the user for the missing values

After generating the secrets, stop and ask the user for these three values:

1. **Neon password** — "What is your current Neon database password? 
   (Go to neon.tech → your project → Connect → Reset password to get a new one)"

2. **Cloudinary Cloud Name** — "What is your Cloudinary Cloud Name? 
   (Go to cloudinary.com → Dashboard — it shows at the top, looks like: dxxxxxxxxx)"

3. **Cloudinary API Secret** — "What is your NEW Cloudinary API Secret after rotating? 
   (Go to cloudinary.com → Settings → Access Keys → regenerate)"

4. **Resend API Key** — "Do you have a Resend API key? 
   (Go to resend.com → sign up free → API Keys → Create API Key)
   If not, type NO and we will leave it blank for now — emails won't send 
   but everything else will work"

Once the user provides these values, fill them into BOTH `.env` and `.env.local`.

---

## STEP 5 — Run database commands

After the env files are complete, run these three commands in order:

```bash
npx prisma db push
```
Wait for it to finish. If it succeeds, run:

```bash
npx prisma generate
```
Wait for it to finish. Then run:

```bash
npx prisma db seed
```
Wait for it to finish.

---

## STEP 6 — Run the build check

Run:

```bash
npm run build
```

Wait for it to finish completely.

---

## STEP 7 — Send a full report

After all commands have run, write a report in this exact format:

---

### ✅ BEEJAY SAX — Pre-Deployment Report

**Environment Files**
- .env created: YES / NO
- .env.local created: YES / NO
- NEXTAUTH_SECRET set: YES / NO
- DATABASE_URL set: YES / NO
- DIRECT_URL set: YES / NO
- CLOUDINARY vars set: YES / NO
- RESEND_API_KEY set: YES / NO (SKIPPED if not provided)
- ADMIN_VERIFY_KEY set: YES / NO

**Database**
- prisma db push: ✅ SUCCESS / ❌ FAILED — (error message if failed)
- prisma generate: ✅ SUCCESS / ❌ FAILED
- prisma db seed: ✅ SUCCESS / ❌ FAILED — (show seed output)

**Build**
- npm run build: ✅ SUCCESS / ❌ FAILED
- Build errors: NONE / (list any errors)
- TypeScript errors: NONE / (list any errors)
- ESLint errors: NONE / (list any errors)

**Ready for Vercel deployment: YES / NO**

If NO — list exactly what needs to be fixed before deploying.

---

## IMPORTANT RULES

- Do NOT print any secret values in the chat
- Do NOT commit .env or .env.local to git (they should already be in .gitignore)
- Confirm .env and .env.local are both listed in .gitignore — if not, add them
- Both files must be identical when complete

---

*BeeJay Sax — SonsHub Media Ltd.*
