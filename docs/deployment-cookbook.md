# RigNexus Deployment Cookbook

Deploy the RigNexus store to a Bangladesh-hosted server with your own domain, using only local payment methods (bKash/Nagad/Rocket).

This cookbook is written to be followed from top to bottom, one command at a time. Every phase ends with a **Verify** step. Do not skip the Verify steps — they catch 90% of problems early.

---

## Quick reference cheat sheet

Keep this table open while working. Full explanations are in the phases below.

| What | Where / Command |
|---|---|
| Server login | `ssh root@VPS_IP` |
| Update server | `apt update && apt upgrade -y` |
| Firewall | `ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp && ufw allow 8000/tcp && ufw --force enable` |
| Create uploads folder | `mkdir -p /srv/rignexus/uploads` |
| Install Coolify | `env ROOT_USERNAME=... ROOT_USER_EMAIL=... ROOT_USER_PASSWORD=... bash -c 'curl -fsSL https://cdn.coollabs.io/coolify/install.sh \| bash'` |
| Coolify dashboard | `http://VPS_IP:8000` |
| Backup Coolify secrets | `cp /data/coolify/source/.env /root/coolify-env-backup.txt` |
| Local DB backup | `npm run db:backup` (creates `backups/ecommerce_db-<timestamp>.sql`) |
| Copy DB to server | `scp backups/ecommerce_db-<timestamp>.sql root@VPS_IP:/root/` |
| Find MySQL container | `docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"` |
| Restore DB | `docker exec -i <mysql-container> sh -c 'exec mysql -uroot -p"$MYSQL_ROOT_PASSWORD" ecommerce_db' < /root/backup.sql` |
| Copy uploads to server | `scp -r public/uploads/. root@VPS_IP:/srv/rignexus/uploads/` |
| App env values | `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `AUTH_TRUST_HOST`, `NEXT_PUBLIC_APP_URL`, `STORE_ID`, `STORE_PASSWORD`, `IS_LIVE`, `NIXPACKS_NODE_VERSION=22` |
| Migrations (app terminal) | `npx prisma migrate deploy` |
| Deploy new code | `git push origin master` (auto-deploys if webhook is set) |
| Cron example | `node scripts/content/publish-scheduled.js` scheduled `5 0 * * *` |
| Manual DB dump | `docker exec <mysql-container> sh -c 'exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --single-transaction ecommerce_db' \| gzip > /root/ecommerce_db-$(date +%F).sql.gz` |

---

## Table of contents

1. [What you are building](#1-what-you-are-building)
2. [Values you must fill in](#2-values-you-must-fill-in)
3. [Phase 0 — Prepare your PC and project](#phase-0--prepare-your-pc-and-project)
4. [Phase 1 — Prepare the server](#phase-1--prepare-the-server)
5. [Phase 2 — Install Coolify](#phase-2--install-coolify)
6. [Phase 3 — Connect the domain (BTCL DNS)](#phase-3--connect-the-domain-btcl-dns)
7. [Phase 4 — Create the MySQL database in Coolify](#phase-4--create-the-mysql-database-in-coolify)
8. [Phase 5 — Create the web application in Coolify](#phase-5--create-the-web-application-in-coolify)
9. [Phase 6 — Restore your database](#phase-6--restore-your-database)
10. [Phase 7 — First migration, first visit, admin login](#phase-7--first-migration-first-visit-admin-login)
11. [Phase 8 — Move your uploaded images](#phase-8--move-your-uploaded-images)
12. [Phase 9 — HTTPS and the dashboard domain](#phase-9--https-and-the-dashboard-domain)
13. [Phase 10 — Payment gateway go-live (SSLCommerz)](#phase-10--payment-gateway-go-live-sslcommerz)
14. [Day-2 operations](#day-2-operations)
15. [Troubleshooting](#troubleshooting)
16. [Security checklist](#security-checklist)
17. [Appendices](#appendix-a--environment-variables-reference)

---

## 1. What you are building

Plain-English overview:

- **Domain**: `rignexus.com.bd`, bought at BTCL (the official `.bd` registry). DNS records are managed inside the BTCL domain portal. Everything is paid with bKash/Nagad.
- **Server (VPS)**: an ExonHost "BDIX SSD 4G" virtual machine in Dhaka, running Ubuntu 24.04. It has 4 CPU cores, 4 GB RAM and 50 GB disk. ExonHost accepts bKash.
- **Coolify**: free control panel software installed on the VPS. It runs your app in Docker, gives you HTTPS certificates automatically, deploys from GitHub, and runs cron-style scheduled tasks.
- **Database**: MySQL 8, created as a container by Coolify on the same VPS. Your Prisma schema lives there.
- **Application**: this Next.js project, pulled from GitHub (`dew97-tech/rignexus`, branch `master`), built by Coolify and served on port 3000.
- **Traefik** (installed by Coolify) is the web entry point. It listens on ports 80/443 and routes `rignexus.com.bd` to your app, and issues free Let's Encrypt SSL certificates.

Traffic path:

```
Customer -> rignexus.com.bd (BTCL DNS) -> VPS IP (Dhaka, BDIX)
         -> Traefik (80/443) -> Next.js app container (3000) -> MySQL container (3306)
                              -> /srv/rignexus/uploads (persistent files)
```

### How the domain finds the server (BTCL + ExonHost)

A common question at this point: the domain is bought from BTCL and the VPS from ExonHost, so how do the two companies know about each other? They don't. You connect them yourself with a DNS record.

Step by step:

1. ExonHost gives your VPS a **public IP address** (for example `103.120.x.x`). That is the server's address on the internet — like a phone number.
2. In the **BTCL DNS panel**, you create an **A record** that says: "`rignexus.com.bd` lives at `103.120.x.x`". This is the only link between the domain and the server.
3. When a customer types the domain, their computer asks BTCL's name servers where it lives, gets your VPS IP, and connects to that server.
4. On the VPS, **Traefik** (installed by Coolify) reads the `Host: rignexus.com.bd` part of the request, routes it to your app container, and serves the matching SSL certificate for that domain.

```
Customer types rignexus.com.bd
        |
        v
BTCL DNS answers: "go to 103.x.x.x"     <-- you create this A record
        |
        v
ExonHost VPS receives the request at 103.x.x.x
        |
        v
Coolify/Traefik sees "Host: rignexus.com.bd" and forwards to your app
        |
        v
Traefik also issued the SSL certificate for that exact domain
```

Things this means in practice:

- **No domain transfer to ExonHost.** The domain stays registered at BTCL; ExonHost only hosts the server.
- **No nameserver change.** You keep BTCL's name servers and simply add records in the BTCL DNS panel (up to 10 records are free).
- **ExonHost does not need the domain name anywhere.** If the VPS has its own hostname like `vps123.exonhost.com`, that is only the server's label and plays no role in your store's address.
- **ExonHost support cannot edit your DNS.** If the address does not work, the first thing to check is the A record in the BTCL panel.
- The same panel later holds your email records (MX, SPF, DKIM) if you set up `support@rignexus.com.bd` — see Appendix B.

Costs (approximate, September 2026):

| Item | Cost | Notes |
|---|---|---|
| `.com.bd` domain, first year | BDT 700 + VAT (about BDT 805) | BTCL official rate; renewal BDT 1,020 + VAT (about BDT 1,173) |
| VPS 4G | Confirm price at checkout | 2G plan is $3.99/month; VPS is non-refundable |
| Coolify | Free | Open source |
| SSL certificate | Free | Let's Encrypt, auto-renewed |
| Email for `support@` | Free | Zoho Mail free plan, see Appendix B |

Glossary of the words used in this cookbook:

| Word | Meaning |
|---|---|
| **VPS** | A rented computer in a data center that you control completely. |
| **SSH** | The secure way to log in to that computer from your PC's terminal. |
| **Container** | A packaged, isolated copy of a program (your app, MySQL) managed by Docker. |
| **Volume / mount** | A folder on the VPS that stays alive when containers are replaced (used for uploaded images). |
| **Migration** | A Prisma command that makes the database structure match the code. |
| **Webhook** | A GitHub setting that tells Coolify "new code was pushed, deploy it". |

---

## 2. Values you must fill in

Print or copy this table and fill it in as you go. Commands later use these values.

| Name | Your value | Where it comes from |
|---|---|---|
| `VPS_IP` | __________________ | ExonHost email after purchase |
| VPS root password | __________________ | ExonHost email after purchase |
| `DOMAIN` | `rignexus.com.bd` | BTCL |
| Coolify root email | __________________ | Choose a real email you own |
| Coolify root password | __________________ | Create a strong one (8+ chars, upper, lower, number, symbol) |
| MySQL root password | __________________ | Set when creating the database in Coolify |
| MySQL user / password | __________________ | Shown in Coolify MySQL resource |
| `AUTH_SECRET` | __________________ | Generate with the command in Phase 5 |
| `STORE_ID` / `STORE_PASSWORD` | __________________ | SSLCommerz merchant panel |
| Admin login email / password | __________________ | Existing store admin account (restored from the database backup) |

Placeholders used below: `<VPS_IP>`, `<mysql-container>`, `<timestamp>`, `<app-container>`.

---

## Phase 0 — Prepare your PC and project

### 0.1 Confirm the project builds

Open a terminal in the project folder and run:

```bash
npm run lint
npm run build
```

Expected: both finish without errors. If either fails, fix it before continuing — a broken build will also break the server deploy.

### 0.2 Make sure `mysqldump` is available

The backup command uses MySQL's `mysqldump` program.

```bash
mysqldump --version
```

Expected: a version number. If you see "command not found", add MySQL's `bin` folder to your Windows PATH (for example `C:\Program Files\MySQL\MySQL Server 8.0\bin`), close the terminal, open it again, and retry.

### 0.3 Create a database backup

```bash
npm run db:backup
```

Expected output:

```
Backing up "ecommerce_db" to ...\backups\ecommerce_db-<timestamp>.sql ...
Backup complete: 12.3 MB
```

Note the exact file name; you will copy it to the server in Phase 6.

### 0.4 Record your local row counts (for comparison later)

Run this and write down the numbers (replace the password with your local `.env` value):

```bash
mysql -h 127.0.0.1 -u ecommerce -p ecommerce_db -e "SELECT COUNT(*) AS products FROM Product; SELECT COUNT(*) AS users FROM User;"
```

Expected: product count (for example 24,000ish) and user count. You will compare these after the restore in Phase 6.

**Verify:** you have `backups/ecommerce_db-<timestamp>.sql`, and the file is more than a few KB.

---

## Phase 1 — Prepare the server

### 1.1 Log in to the VPS

From your PC:

```bash
ssh root@<VPS_IP>
```

Type the root password from the ExonHost email. The first time, answer `yes` to the fingerprint question.

Expected: a prompt like `root@vps:~#`.

### 1.2 Update the operating system

```bash
apt update && apt upgrade -y
```

Expected: packages upgrade without errors. If a "restart required" file is mentioned, run `reboot` later — not now.

### 1.3 Install basic tools

```bash
apt install -y curl wget nano git ufw fail2ban unzip
```

### 1.4 Set the timezone to Dhaka

```bash
timedatectl set-timezone Asia/Dhaka
timedatectl
```

Expected: `Time zone: Asia/Dhaka (+06, +0600)`.

This matters because scheduled tasks and database backups use the server timezone.

### 1.5 Add 2 GB of swap (recommended safety for builds)

```bash
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
free -h
```

Expected: the `Swap` row shows `2.0Gi`. Swap protects the server if a build briefly uses more than 4 GB RAM.

### 1.6 Confirm virtualization and architecture

```bash
systemd-detect-virt
uname -m
```

Expected: `kvm` and `x86_64`. Docker needs KVM, and ExonHost VPS is KVM.

### 1.7 Open the firewall

```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 8000/tcp
ufw --force enable
ufw status
```

Expected: all four rules allowed, status `active`.

- `22` = SSH
- `80/443` = websites and SSL certificates
- `8000` = Coolify dashboard (we restrict this later in Phase 9)

### 1.8 Set up SSH keys (strongly recommended)

Do this from a **new PowerShell window on your PC** (keep the current SSH session open as a safety net):

```powershell
ssh-keygen -t ed25519 -C "rignexus-vps"
# press Enter three times to accept defaults and empty passphrase (or set one)
type $env:USERPROFILE\.ssh\id_ed25519.pub | ssh root@<VPS_IP> "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
```

Now test key login in another new window:

```bash
ssh root@<VPS_IP>
```

If it logs in without asking for a password, disable password logins on the server:

```bash
printf 'PasswordAuthentication no\nPermitRootLogin prohibit-password\n' > /etc/ssh/sshd_config.d/99-rignexus.conf
systemctl restart ssh
```

**Important:** before closing your old session, open one more new SSH window and confirm key login still works. If it does not, restore password login by deleting that file and restarting ssh.

### 1.9 Create the uploads folder

```bash
mkdir -p /srv/rignexus/uploads
chmod 755 /srv/rignexus/uploads
ls -ld /srv/rignexus/uploads
```

Expected: the folder exists with `drwxr-xr-x` permissions. This folder will hold product images, avatars, banners and blog images uploaded from the admin panel, and it survives every redeploy.

**Verify:** `ufw status` is active, `free -h` shows swap, and `/srv/rignexus/uploads` exists.

---

## Phase 2 — Install Coolify

### 2.1 Run the installer with a pre-created admin account

Log in to the VPS (if you are not already) and run this single command, replacing the three values:

```bash
env ROOT_USERNAME=RootUser \
ROOT_USER_EMAIL=you@example.com \
ROOT_USER_PASSWORD='ChangeThis-Strong-123!' \
bash -c 'curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash'
```

Rules (enforced by Coolify):

- Username: letters, numbers, spaces, underscores, hyphens (3–255 characters).
- Email: must be valid and have a working DNS record.
- Password: at least 8 characters, with uppercase, lowercase, a number, and a special symbol.

Why this form: it creates your admin account during install, so the public registration page is never exposed to strangers.

### 2.2 Open the dashboard and enable 2FA

Open `http://<VPS_IP>:8000` in your browser and log in.

Then open your profile (top-right) and enable **Two-Factor Authentication**.

### 2.3 Back up Coolify's secrets

Coolify stores an encryption key in `/data/coolify/source/.env`. Without it, Coolify backups cannot be restored.

```bash
cp /data/coolify/source/.env /root/coolify-env-backup.txt
chmod 600 /root/coolify-env-backup.txt
```

Copy it to your PC too:

```bash
# run this on your PC, not the server
scp root@<VPS_IP>:/root/coolify-env-backup.txt .
```

Keep it somewhere safe and private (password manager or encrypted folder). Never commit it to git.

### 2.4 Verify the install

```bash
docker ps
```

Expected: several running containers, including `coolify` and `coolify-proxy` (Traefik).

**Verify:** the dashboard loads and 2FA is on; `docker ps` shows Coolify running; `coolify-env-backup.txt` is saved on your PC.

---

## Phase 3 — Connect the domain (BTCL DNS)

### 3.1 Add DNS records in the BTCL portal

Log in to your BTCL domain account (`bdia.btcl.com.bd` or `domainreg.btcl.com.bd`), open your domain, and go to **DNS Management** (DNS records panel). Add these three records:

| Type | Host / Name | Value | TTL |
|---|---|---|---|
| A | `@` (some panels want it blank) | `<VPS_IP>` | 300 |
| CNAME | `www` | `rignexus.com.bd` | 300 |
| A | `coolify` | `<VPS_IP>` | 300 |

Notes:

- Your BTCL plan includes up to 10 DNS records for free; these three are enough.
- If the panel only accepts hostnames without `@`, use the empty/root option if available, or the literal `@` as shown.
- TTL 300 seconds (5 minutes) lets you change records quickly later.

### 3.2 Verify DNS from your PC

Wait 5–30 minutes, then run on your PC:

```bash
nslookup rignexus.com.bd
nslookup www.rignexus.com.bd
nslookup coolify.rignexus.com.bd
```

Expected: each answers with `<VPS_IP>`.

If it still shows old or no values after an hour, re-check the records in the BTCL panel. DNS can take a few hours in the worst case.

**Verify:** all three names resolve to the VPS IP.

---

## Phase 4 — Create the MySQL database in Coolify

### 4.1 Create the project

In Coolify: **Projects → + Add → name it `rignexus` → Production environment.**

### 4.2 Create the MySQL resource

**+ New Resource → Databases → MySQL** and set:

| Setting | Value |
|---|---|
| Name | `rignexus-db` |
| MySQL Root Password | click generate / set a strong password and save it in your inventory table |

Before deploying, open the resource's **Environment Variables** and make sure:

| Variable | Value |
|---|---|
| `MYSQL_DATABASE` | `ecommerce_db` |
| `MYSQL_USER` | note the generated user (e.g. `mysql`) |
| `MYSQL_PASSWORD` | note the generated password |

Then click **Deploy** and wait until the status is **Running (healthy)**.

### 4.3 Verify inside the database container

Open the database resource's **Terminal** tab and run:

```bash
mysql -u root -p"$MYSQL_ROOT_PASSWORD" -e "SHOW DATABASES; SELECT VERSION();"
```

Expected: a list that includes `ecommerce_db`, and a version starting with `8.`.

### 4.4 Copy the internal connection URL

On the database page, find the connection strings. Use the **internal** URL (the one whose host is the container name, not the public IP). It looks like:

```
mysql://<MYSQL_USER>:<MYSQL_PASSWORD>@<db-container-host>:3306/ecommerce_db
```

Save it — this becomes `DATABASE_URL` in Phase 5. Do **not** enable a public port.

**Verify:** MySQL is healthy, `ecommerce_db` exists, and you have the internal URL saved.

---

## Phase 5 — Create the web application in Coolify

### 5.1 Create the application

**+ New Resource → Applications → Public Repository** and set:

| Setting | Value |
|---|---|
| Repository URL | `https://github.com/dew97-tech/rignexus` |
| Branch | `master` |
| Build Pack | `Nixpacks` |
| Ports Exposes | `3000` |
| Name | `rignexus-web` |

### 5.2 Check the detected commands

Open **Configuration → General** and confirm:

| Field | Expected |
|---|---|
| Install Command | auto-detected (`npm ci` or `npm install`) |
| Build Command | auto-detected (`npm run build`) |
| Start Command | `npm run start` (set it manually if the field is empty) |

### 5.3 Add environment variables

Open **Configuration → Environment Variables** and add each row below. Turn **Build Variable** ON only where stated — that makes the value available while the app is being built, which matters for `NEXT_PUBLIC_APP_URL`.

| Variable | Value | Build Variable |
|---|---|---|
| `DATABASE_URL` | internal MySQL URL from Phase 4.4 | OFF |
| `AUTH_SECRET` | output of the generate command below | OFF |
| `NEXTAUTH_URL` | `https://rignexus.com.bd` | OFF |
| `AUTH_TRUST_HOST` | `true` | OFF |
| `NEXT_PUBLIC_APP_URL` | `https://rignexus.com.bd` | **ON** |
| `STORE_ID` | your SSLCommerz store id | OFF |
| `STORE_PASSWORD` | your SSLCommerz store password | OFF |
| `IS_LIVE` | `false` for now (Phase 10 switches it) | OFF |
| `NIXPACKS_NODE_VERSION` | `22` | **ON** |

Generate `AUTH_SECRET` on your PC with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the whole output as the value.

Why `NIXPACKS_NODE_VERSION=22`: the project requires Node 20.9 or newer, and this pins a known-good major version. Why `NEXT_PUBLIC_APP_URL` must be a build variable: the sitemap, robots file, feed, page metadata and payment callback URLs are baked in during the build.

### 5.4 Add persistent storage for uploads

Open **Configuration → Persistent Storage → + Add → Volume Mount** and set:

| Field | Value |
|---|---|
| Name | `uploads` |
| Source Path | `/srv/rignexus/uploads` |
| Destination Path | `/app/public/uploads` |

Why `/app/public/uploads`: the application writes every uploaded file to `public/uploads` inside its working directory, and Nixpacks containers use `/app` as the project root. The Source Path is the folder you created in Phase 1.9.

### 5.5 Set the domains

Open **Configuration → General → Domains** and add both:

```
https://rignexus.com.bd
https://www.rignexus.com.bd
```

Coolify will request SSL certificates automatically once DNS points at the server.

### 5.6 Add the pre-deployment migration command

In the build/deployment settings, set **Pre-deployment Command**:

```bash
npx prisma migrate deploy
```

Important: Coolify skips this command on the very first deployment (there is no container yet). Phase 7 handles the first migration manually. From the second deployment onward this keeps the database structure current automatically.

### 5.7 Enable auto-deploy from GitHub (optional but recommended)

In the application, open the **Webhooks** tab and copy the GitHub webhook URL and secret.

Then on GitHub: **repo → Settings → Webhooks → Add webhook**:

| Field | Value |
|---|---|
| Payload URL | the URL from Coolify |
| Content type | `application/json` |
| Secret | the secret from Coolify |
| Events | Just the push event |

After this, every `git push origin master` deploys automatically.

### 5.8 Deploy

Click **Deploy** and watch the build log. A first build typically takes 3–10 minutes on this server.

Expected log highlights:

- dependencies installed
- `prisma generate` runs (the project's `postinstall`)
- `next build` completes
- container starts with `Ready`

Note: the website will show database errors until Phase 6 restores your data. That is expected.

### 5.9 Verify

```bash
docker ps
```

Expected: the app container is running. In Coolify, the deployment status is **Running (healthy)**.

**Verify:** the build log ends with a successful deployment, and the app container is running.

---

## Phase 6 — Restore your database

### 6.1 Copy the backup to the server

From your PC, in the project folder:

```bash
scp backups/ecommerce_db-<timestamp>.sql root@<VPS_IP>:/root/
```

Expected: a progress bar, then a normal prompt.

### 6.2 Find the MySQL container name

Run on the server:

```bash
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}"
```

Expected: a row whose image contains `mysql`; note its `Names` value — this is `<mysql-container>` below.

### 6.3 Import the backup

Run on the server (replace `<mysql-container>` and the file name):

```bash
docker exec -i <mysql-container> sh -c 'exec mysql -uroot -p"$MYSQL_ROOT_PASSWORD" ecommerce_db' < /root/ecommerce_db-<timestamp>.sql
```

If this prints no errors, the import succeeded. Warnings about deprecated syntax are harmless.

If you get "Access denied", the root password variable may have a different name. Check it with:

```bash
docker exec <mysql-container> env | grep MYSQL
```

### 6.4 Verify the restore with row counts

Create a small check file and run it inside the container:

```bash
cat > /root/verify.sql <<'EOF'
SELECT COUNT(*) AS products FROM Product;
SELECT COUNT(*) AS users FROM User;
SELECT COUNT(*) AS orders FROM `Order`;
SELECT COUNT(*) AS categories FROM Category;
EOF

docker exec -i <mysql-container> sh -c 'exec mysql -uroot -p"$MYSQL_ROOT_PASSWORD" ecommerce_db' < /root/verify.sql
```

Expected: numbers that match what you recorded in Phase 0.4 (plus orders/categories; compare against your local database).

Note the backticks around `` `Order` `` — `Order` is a reserved SQL word, so it must be quoted.

**Verify:** product and user counts match your local database.

---

## Phase 7 — First migration, first visit, admin login

### 7.1 Check migration status

In Coolify, open the app → **Terminal** and run:

```bash
npx prisma migrate status
```

Expected: "Database schema is up to date!"

Because your database backup already contains the `_prisma_migrations` table, no migration is needed. If the command says migrations are pending, run:

```bash
npx prisma migrate deploy
```

### 7.2 Visit the site

Open a browser:

- `http://rignexus.com.bd` should redirect to `https://rignexus.com.bd` once the certificate is ready (Phase 9).
- The homepage should show categories and products.

### 7.3 Log in to the admin panel

Go to `https://rignexus.com.bd/admin` and log in with your existing store admin account (restored from the backup).

Fallback if you need to reset the admin password:

```bash
# app container Terminal
node scripts/seed/promote-admin.js
```

This script uses the `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `ADMIN_NAME` environment variables (add them in Coolify if you want to use this fallback).

**Verify:** homepage loads with products, and `/admin` login works.

---

## Phase 8 — Move your uploaded images

Product photos that come from the catalog source are remote URLs (no transfer needed), and category tiles and banners are committed to git (they ship with the code). Only files in `public/uploads` need copying — for example avatars, banners and blog images uploaded through the admin panel.

### 8.1 Copy the files

From your PC, in the project folder:

```bash
scp -r public/uploads/. root@<VPS_IP>:/srv/rignexus/uploads/
```

The trailing `/.` means "the contents of this folder", so files land directly in `/srv/rignexus/uploads`.

### 8.2 Verify on the server

```bash
ls -la /srv/rignexus/uploads
```

Expected: your uploaded files and folders (`avatars/`, `content/`, etc.).

### 8.3 Test that uploads persist across deployments

1. In the admin panel, upload a new product image (or change your avatar).
2. Confirm the file appears on the server:

   ```bash
   ls -lt /srv/rignexus/uploads | head
   ```

3. In Coolify, click **Redeploy** on the application.
4. After the deploy, open the page with that image and confirm it still loads.

This is the single most important test in the cookbook. It proves the mount works. Without it, every redeploy would silently wipe newly uploaded files.

If uploads fail with a permission error, check who the container runs as:

```bash
# app container Terminal
id

# on the server
ls -ln /srv/rignexus/uploads
```

If the container writes as a non-root user (for example uid 1000), give that user ownership:

```bash
chown -R 1000:1000 /srv/rignexus/uploads
```

**Verify:** a newly uploaded image survives a redeploy.

---

## Phase 9 — HTTPS and the dashboard domain

### 9.1 Check the certificate

Coolify's Traefik requests a Let's Encrypt certificate automatically when the domain points to the server and ports 80/443 are open. In your browser, open `https://rignexus.com.bd` and confirm the padlock.

From your PC:

```bash
curl -I http://rignexus.com.bd
curl -I https://rignexus.com.bd
```

Expected: the first returns `301` (redirect to https), the second returns `200`.

Certificates renew automatically through Traefik — no action needed.

### 9.2 Put the Coolify dashboard on its own HTTPS domain

In Coolify: **Settings → Instance Domain** and set:

```
https://coolify.rignexus.com.bd
```

The DNS record for `coolify` was added in Phase 3, so this should get a certificate within a minute or two. Open it and confirm the padlock.

### 9.3 Reduce dashboard exposure

With the dashboard on HTTPS, you can remove the public port-8000 rule:

```bash
ufw delete allow 8000/tcp
```

Important detail about Docker: containers can publish ports independently of UFW, so this alone may not close port 8000 from the outside. Two good options:

1. Keep the strong password + 2FA, and treat the dashboard as protected by authentication (acceptable for most small stores).
2. For strict blocking, install the `ufw-docker` helper and re-apply rules, or use a hosting-level firewall if ExonHost offers one.

**Verify:** both `https://rignexus.com.bd` and `https://coolify.rignexus.com.bd` show valid certificates.

---

## Phase 10 — Payment gateway go-live (SSLCommerz)

### 10.1 Test in sandbox first

The app currently runs with `IS_LIVE=false`. Place a test order on the site and complete the sandbox payment flow. SSLCommerz sandbox lets you simulate success, failure and cancellation.

Check these endpoints respond (they receive SSLCommerz server callbacks):

- `https://rignexus.com.bd/api/sslcommerz/ipn`
- `https://rignexus.com.bd/api/sslcommerz/success`
- `https://rignexus.com.bd/api/sslcommerz/fail`
- `https://rignexus.com.bd/api/sslcommerz/cancel`

Verify the order appears in **Admin → Orders** with the correct status.

### 10.2 Switch to live

1. In the SSLCommerz merchant panel, make sure your live store is active and the domain `rignexus.com.bd` is allowed/whitelisted if asked.
2. In Coolify, edit the app's environment variables:
   - `STORE_ID` = live store id
   - `STORE_PASSWORD` = live store password
   - `IS_LIVE` = `true`
3. Click **Deploy** (an environment change needs a redeploy).
4. Make one small real transaction and confirm the order and payment status in the admin panel.

Keep the sandbox credentials in a safe place in case you need to test again. To go back to sandbox, set `IS_LIVE=false` and redeploy.

**Verify:** a real payment produces a paid order.

---

## Day-2 operations

### Deploy a code change

```bash
# on your PC
git add .
git commit -m "your message"
git push origin master
```

If the GitHub webhook is set (Phase 5.7), Coolify deploys automatically. Otherwise click **Deploy** in Coolify.

### Roll back a bad deploy

Coolify stores per-deployment history. Open the app → **Deployments**, find the last good deployment, and click **Redeploy**. Because uploads and the database live outside containers, rollbacks do not lose data.

### Read logs

- App logs: app → **Logs** tab (build and runtime logs separately).
- App shell: app → **Terminal**.
- Database shell: database → **Terminal**.

### Scheduled task (example: publish scheduled blog posts)

Coolify runs commands inside the app container on a schedule. Open the app → **Configuration → Scheduled Tasks → + Add**:

| Field | Value |
|---|---|
| Name | `publish-scheduled-posts` |
| Command | `node scripts/content/publish-scheduled.js` |
| Frequency | `5 0 * * *` (daily at 00:05 Dhaka time) |
| Timeout | `300` |

Do not include `docker exec` in the command — Coolify runs it inside the container for you. You can run the same command with **Execute Now** to test it.

Other useful scripts you could schedule later: `scripts/catalog/refresh.js`, `scripts/maintenance/clean-product-descriptions.js`. Test any script manually in the Terminal first, and never schedule data-changing scripts until you understand what they modify.

### Database backups

Two layers are recommended.

Layer 1 — Coolify scheduled backups (resource → **Backups → + Add**): daily at 02:30, keep 7 copies.

Layer 2 — manual offsite copy, weekly:

```bash
# on the server
docker exec <mysql-container> sh -c 'exec mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --single-transaction --routines --triggers ecommerce_db' | gzip > /root/ecommerce_db-$(date +%F).sql.gz

# on your PC
scp root@<VPS_IP>:/root/ecommerce_db-*.sql.gz .
```

Restore drill (do this once so you know it works):

```bash
docker exec -i <mysql-container> sh -c 'exec mysql -uroot -p"$MYSQL_ROOT_PASSWORD" ecommerce_db' < /root/ecommerce_db-2026-09-12.sql
```

### Uploads backups

The uploads folder supports scheduled file-level archives in Coolify: app → **Persistent Storage**, open the `uploads` mount, and add a backup schedule (for example daily at 03:00, keep 7). You can also make one manually:

```bash
tar -czf /root/uploads-$(date +%F).tar.gz -C /srv/rignexus/uploads .
```

Copy the archive to your PC weekly with `scp`.

### Operating system and Coolify updates

```bash
apt update && apt upgrade -y
apt autoremove -y
```

For Coolify, use the dashboard **Settings → Update**, or re-run the installer script. Before updating, confirm `/root/coolify-env-backup.txt` exists. Apply updates monthly at least — Coolify had security fixes in early 2026, and an outdated dashboard is the weakest point of a self-hosted setup.

### Useful maintenance commands

```bash
df -h                 # disk space
free -h               # memory and swap
docker system df      # Docker disk usage
docker image prune -af  # remove unused images (safe, but rebuilds will re-download)
docker restart coolify  # restart the dashboard if it stops responding
```

### Monitoring

Use a free uptime service (for example UptimeRobot, no card required) to check `https://rignexus.com.bd` every 5 minutes and email you when it is down. Check `df -h` once a month; a full disk is the most common cause of sudden failures.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Build fails with "requires Node >=20.9" | Wrong Node version in builder | Make sure `NIXPACKS_NODE_VERSION=22` is set with Build Variable ON, then redeploy |
| Build is killed or server freezes | Out of memory | Confirm 2 GB swap is active (`free -h`), redeploy; keep other tasks off during build |
| Site returns 500 before Phase 6 | Database not restored yet | Finish Phase 6 |
| Prisma error "Can't reach database server" | Wrong `DATABASE_URL` | Use the internal URL from Phase 4.4, not the public one; confirm MySQL is running |
| Log mentions `sharp` when serving images | Next.js image optimizer needs the sharp library | Run `npm install sharp`, commit, push, redeploy |
| Uploaded image 404 after redeploy | Mount missing or wrong destination | Source `/srv/rignexus/uploads`, Destination `/app/public/uploads`, then redeploy |
| Upload fails with permission denied | Container user cannot write to the host folder | Check `id` in the app container and `ls -ln` on the server, then `chown -R 1000:1000 /srv/rignexus/uploads` |
| SSL certificate not issued | DNS not pointing, port 80 closed, or rate limit | Check `nslookup`, `ufw status`, and Traefik logs in Coolify; wait and redeploy |
| `www` works but bare domain does not (or vice versa) | Only one domain configured | Add both domains in Configuration → General → Domains |
| Page source or sitemap shows `localhost:3000` | `NEXT_PUBLIC_APP_URL` was not a build variable | Enable Build Variable, then redeploy |
| Coolify dashboard unreachable | Dashboard container stopped | `docker ps`, then `docker restart coolify`; confirm port 8000 is allowed |
| Payment completes but order stays unpaid | `IS_LIVE` mismatch or merchant panel URLs wrong | Match `IS_LIVE` to the credentials in use and check app logs for callback errors |
| Disk full | Old images, backups, Docker layers | `docker image prune -af`, remove old `/root/*.gz`, keep fewer backup copies |

---

## Security checklist

- [ ] Coolify admin created during install (no public registration), strong password, 2FA enabled.
- [ ] SSH keys installed; `PasswordAuthentication no` in `/etc/ssh/sshd_config.d/99-rignexus.conf`.
- [ ] UFW active with only 22/80/443 (+8000 during setup).
- [ ] `/root/coolify-env-backup.txt` stored offline (it contains Coolify's `APP_KEY`).
- [ ] All secrets live only in Coolify environment variables — never in git (`.env` is ignored by the repo).
- [ ] SSLCommerz live keys set only when going live; sandbox restored when testing.
- [ ] Coolify and Ubuntu updated monthly.
- [ ] Database and uploads backups scheduled, and one restore tested.
- [ ] `lib/site-config.js` updated with your real support phone and email, then pushed.

---

## Appendix A — Environment variables reference

| Variable | Example | Build var | Purpose |
|---|---|---|---|
| `DATABASE_URL` | `mysql://mysql:pass@rignexus-db-xxxx:3306/ecommerce_db` | No | Prisma connection (internal) |
| `AUTH_SECRET` | 44-char base64 | No | NextAuth session signing |
| `NEXTAUTH_URL` | `https://rignexus.com.bd` | No | Auth callback base URL |
| `AUTH_TRUST_HOST` | `true` | No | Trust proxy headers behind Traefik |
| `NEXT_PUBLIC_APP_URL` | `https://rignexus.com.bd` | **Yes** | Sitemap, robots, feed, metadata, payment callbacks |
| `STORE_ID` | sandbox/live id | No | SSLCommerz |
| `STORE_PASSWORD` | sandbox/live password | No | SSLCommerz |
| `IS_LIVE` | `false` / `true` | No | SSLCommerz environment switch |
| `NIXPACKS_NODE_VERSION` | `22` | **Yes** | Pin the Node build version |
| `ADMIN_EMAIL` | `admin@rignexus.com.bd` | No | Optional, for `promote-admin` fallback |
| `ADMIN_PASSWORD` | strong password | No | Optional, for `promote-admin` fallback |
| `ADMIN_NAME` | `Admin` | No | Optional, for `promote-admin` fallback |

## Appendix B — Zoho Mail for support@rignexus.com.bd

Free plan, no card needed. Sign up at Zoho Mail, choose the free plan, and add `rignexus.com.bd` as your domain. Zoho will show a verification value — add it in the BTCL DNS panel as a TXT record. Then add these records in the BTCL DNS panel (confirm the exact current values inside Zoho's admin panel, since providers occasionally change them):

| Type | Host | Value | Priority |
|---|---|---|---|
| TXT | `@` | Zoho verification string | — |
| MX | `@` | `mx.zoho.com` | 10 |
| MX | `@` | `mx2.zoho.com` | 20 |
| MX | `@` | `mx3.zoho.com` | 50 |
| TXT | `@` | `v=spf1 include:zoho.com ~all` | — |
| TXT | `zoho._domainkey` | DKIM value from Zoho panel | — |

Then create the mailbox `support@rignexus.com.bd` and update `lib/site-config.js`:

```js
supportEmail: "support@rignexus.com.bd",
supportPhone: "+880 1XXX-XXXXXX", // your real number
```

Commit and push; the site updates automatically if the webhook is set.

## Appendix C — BTCL domain facts and renewal

- Official rates (VAT excluded): `.com.bd` registration BDT 700 (discounted; list 1,100), renewal BDT 1,020 (discounted; list 1,600). Add applicable VAT (typically 15%).
- Pay with bKash, Nagad, Teletalk or ekPay inside the BTCL portal.
- Your plan includes up to 10 DNS records at no extra cost.
- Renew before the expiry date. BTCL's late fee is BDT 700 for `.bd`-class domains.
- Keep your NID/trade license documents uploaded in your profile; they are required at registration.
- Ownership changes cost extra (BDT 2,500), so keep the account credentials safe.

## Appendix D — Repo scripts used by this cookbook

The npm scripts add `--env-file=.env`, which expects a `.env` file in the project folder. That exists on your PC but not inside the server container, where Coolify injects the environment variables directly. So: use `npm run ...` locally, and the plain `node ...` form on the server (app container Terminal or a Scheduled Task).

| Task | On your PC | On the server (container) |
|---|---|---|
| Database backup | `npm run db:backup` | see Day-2 manual dump command |
| Publish scheduled blogs | `npm run content:publish` | `node scripts/content/publish-scheduled.js` |
| Promote admin | `npm run promote-admin` | `node scripts/seed/promote-admin.js` |
| Reset admin password | `npm run admin:reset-password` | `node scripts/maintenance/reset-password.js` |
| Description cleanup | `npm run products:clean-descriptions` | `node scripts/maintenance/clean-product-descriptions.js` |
| Category tile seed | `npm run tiles:seed` | `node scripts/seed/seed-category-tiles.js` |

Note: do not run `npm run seed` on the server. It reads `data/source/output.csv`, which is intentionally not committed to git. The database restore is the correct way to move your data.

## Appendix E — File paths that matter

| Path | Meaning |
|---|---|
| `/srv/rignexus/uploads` | Host folder for uploaded images (persistent) |
| `/app/public/uploads` | The same folder inside the app container |
| `/data/coolify/source/.env` | Coolify's own secrets (back this up) |
| `/root/ecommerce_db-*.sql` | Restored backup file (delete when no longer needed) |
| `/root/*.sql.gz`, `/root/*.tar.gz` | Manual backup archives |
| `backups/` (on your PC) | Local Prisma/MySQL dumps |

---

Last reviewed: September 2026. If you repeat this deployment on a new server, change `VPS_IP`, re-run Phase 3's DNS verification first, and restore the newest database backup.
