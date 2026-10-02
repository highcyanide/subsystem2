# 100% Free Multi-Device Integration & Cloud Deployment Guide
**For Students & Developers (Zero Cost, No Expiring Free Trials, No Credit Card Required)**

---

## Table of Contents
1. [Overview: The Best Methods for Students](#1-overview-the-best-methods-for-students)
2. [Method 1: Cloudflare Tunnel (Recommended — Public HTTPS Link, $0 Forever)](#2-method-1-cloudflare-tunnel-recommended--public-https-link-0-forever)
3. [Method 2: Tailscale (Private Encrypted Network, $0 Forever)](#3-method-2-tailscale-private-encrypted-network-0-forever)
4. [Method 3: GitHub Student Developer Pack (Real Cloud VPS, $0 with Student ID)](#4-method-3-github-student-developer-pack-real-cloud-vps-0-with-student-id)
5. [Method 4: Free Cloud MySQL via TiDB Serverless ($0 Forever, No Credit Card)](#5-method-4-free-cloud-mysql-via-tidb-serverless-0-forever-no-credit-card)
6. [Summary Comparison Table](#6-summary-comparison-table)

---

## 1. Overview: The Best Methods for Students

Traditional cloud providers (AWS, Google Cloud, DigitalOcean) require credit cards and start charging once trials expire. Free database hosts like Render sleep after 15 minutes of inactivity or don't support MySQL.

As a student, you have **four battle-tested, 100% free ways** to connect multiple laptops to the same live data with **$0 cost, no trials, and no credit card required**.

---

## 2. Method 1: Cloudflare Tunnel (Recommended — Public HTTPS Link, $0 Forever)

### Why this is the best student method:
- **Cost:** **$0.00 forever** (Cloudflare's free tier has no time limits).
- **Credit Card:** **None required**.
- **Setup Time:** **Under 3 minutes**.
- **How it works:** Your primary laptop (Laptop A) runs MySQL and Laravel as it already does. Cloudflare creates a secure, encrypted HTTPS tunnel from your laptop to Cloudflare's global edge network. Laptop B (and phones, tablets, or professors) simply opens a public link in any browser.

```
┌──────────────────────────────────────────────┐
│  Laptop A (Your Laptop)                      │
│   ├── XAMPP MySQL (Port 3306)                │
│   ├── Laravel app (http://localhost:8000)    │
│   └── Cloudflare Tunnel Client (cloudflared) │
└──────────────────────┬───────────────────────┘
                       │ Encrypted Tunnel
                       ▼
          Cloudflare Global Network
                       │
                       ▼
┌──────────────────────────────────────────────┐
│  Laptop B / Phone / Groupmates               │
│  Opens Chrome / Edge:                        │
│  https://your-tunnel-name.trycloudflare.com  │
└──────────────────────────────────────────────┘
```

### Step-by-Step Instructions:

#### Step 1: Start your local server and database on Laptop A
1. Open **XAMPP Control Panel** and start **MySQL** (and Apache if needed).
2. Open PowerShell or Command Prompt in `c:\xampp\htdocs\subsystem2`:
   ```powershell
   php artisan serve --port=8000
   ```
3. In a second terminal tab, run Vite:
   ```powershell
   npm run dev
   ```
   *(Ensure `http://127.0.0.1:8000` is working in your browser).*

#### Step 2: Download the official Cloudflare Tunnel tool (`cloudflared`)
On Laptop A, open PowerShell as Administrator and run:
```powershell
winget install --id Cloudflare.cloudflared
```
*Alternative (Manual Download):*
If you prefer direct download without winget:
1. Download `cloudflared-windows-amd64.exe` from the [official Cloudflare GitHub releases](https://github.com/cloudflare/cloudflared/releases/latest).
2. Rename it to `cloudflared.exe` and place it in `C:\Windows\System32` (or in your project root).

#### Step 3: Launch the Tunnel (1 Single Command)
Open PowerShell and run:
```powershell
cloudflared tunnel --url http://localhost:8000
```

#### Step 4: Access from Laptop B
1. Cloudflare will output a public URL in your terminal that looks like:
   ```text
   +--------------------------------------------------------------------------------------------+
   |  Your quick Tunnel has been created! Visit it at (it may take some time to be reachable):  |
   |  https://random-words-here.trycloudflare.com                                               |
   +--------------------------------------------------------------------------------------------+
   ```
2. Copy that `https://...trycloudflare.com` URL.
3. Open Google Chrome or Microsoft Edge on **Laptop B** (or even on your smartphone).
4. Paste the URL.
5. **Done!** Laptop B can now log in, record sales, adjust inventory, and view reports. Every transaction is saved directly to Laptop A's MySQL database in real time.

> [!NOTE]
> The link remains active as long as Laptop A is open and the `cloudflared` command is running. Whenever you close your laptop, the tunnel pauses. When you re-run the command, it generates a fresh link.

---

## 3. Method 2: Tailscale (Private Encrypted Network, $0 Forever)

### Why choose Tailscale:
- **Cost:** **$0.00 forever** (Free Personal Plan includes up to 100 devices and 3 users).
- **Credit Card:** **None required**.
- **Privacy:** Only invited devices can connect (not open to the general public).
- **Locations:** Works across different homes, coffee shops, campus Wi-Fi, or mobile data hotspots.

```
   [ Laptop A (At Home) ]                    [ Laptop B (At Campus / School) ]
   Tailscale IP: 100.85.12.34                Tailscale IP: 100.92.56.78
            │                                         │
            └────────── Encrypted Peer-to-Peer ───────┘
```

### Step-by-Step Instructions:

#### Step 1: Install Tailscale on Laptop A and Laptop B
1. Go to **[tailscale.com](https://tailscale.com/)** and click **Get Started for Free**.
2. Sign in with your personal Google or Microsoft account.
3. Download and install **Tailscale for Windows** on both Laptop A and Laptop B.
4. Log into the same Tailscale account on both laptops.

#### Step 2: Get Laptop A's Tailscale IP
1. Click the Tailscale tray icon on Laptop A.
2. Note your 100.x.y.z IP address (for example, `100.85.12.34`).

#### Step 3: Run Laravel on Laptop A accepting all connections
On Laptop A, run `php artisan serve` with `--host 0.0.0.0`:
```powershell
php artisan serve --host 0.0.0.0 --port 8000
```

#### Step 4: Open on Laptop B
1. On Laptop B, open Chrome or Edge and navigate to:
   ```text
   http://100.85.12.34:8000
   ```
   *(Replace with Laptop A's actual Tailscale IP).*
2. Both laptops are now connected directly through an encrypted tunnel with zero configuration.

---

## 4. Method 3: GitHub Student Developer Pack (Real Cloud VPS, $0 with Student ID)

If you want a **true 24/7 cloud server** that stays online even when both laptops are closed, use your student status.

### What is the GitHub Student Pack?
GitHub partners with major cloud providers to give verified students free cloud credits:
- **DigitalOcean:** **$200 in Cloud Credits** (lasts ~2 to 3 years of free VPS hosting).
- **Microsoft Azure for Students:** **$100 credit + 12 months free popular services (NO credit card required)**.
- **Namecheap / Name.com:** **Free `.me` or `.live` domain name for 1 year**.

### Step-by-Step Instructions:

#### Step 1: Claim your Student Pack
1. Visit **[education.github.com/pack](https://education.github.com/pack)**.
2. Sign in with your GitHub account.
3. Submit proof of enrollment (school-issued `.edu` email address or a photo of your Student ID card).
4. Approval usually takes between 1 hour and 48 hours.

#### Step 2: Launch a 100% Free Cloud VPS (DigitalOcean Droplet)
1. In your GitHub Student Pack dashboard, claim the **DigitalOcean $200 promo code**.
2. Create a new **Droplet**:
   - **Distribution:** Ubuntu 24.04 LTS
   - **Plan:** Basic ($4 or $6/mo — fully covered by your $200 credit)
   - **Datacenter:** Singapore (`sgp1`) or the closest region to the Philippines
   - **Authentication:** SSH Key or Root Password
3. Click **Create Droplet**. You will receive a Public IP address (e.g. `159.223.x.x`).

#### Step 3: Provision the Cloud Server (One-Time Setup)
Connect to your server via PowerShell or PuTTY:
```bash
ssh root@159.223.x.x
```
Run the following setup commands:
```bash
# 1. Update packages
sudo apt update && sudo apt upgrade -y

# 2. Install PHP 8.3, Nginx, MySQL, and required extensions
sudo apt install -y nginx mysql-server git unzip curl
sudo add-apt-repository -y ppa:ondrej/php
sudo apt update
sudo apt install -y php8.3-fpm php8.3-mysql php8.3-mbstring php8.3-xml php8.3-bcmath php8.3-curl php8.3-zip

# 3. Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# 4. Install Node.js 20 LTS (for Vite asset build)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

#### Step 4: Create the MySQL Database on the Cloud
```bash
sudo mysql
```
Inside the MySQL shell, run:
```sql
CREATE DATABASE warehouse_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'warehouse_user'@'localhost' IDENTIFIED BY 'YourSuperSecretPassword123!';
GRANT ALL PRIVILEGES ON warehouse_db.* TO 'warehouse_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Step 5: Deploy the Project
```bash
# Clone your repository
cd /var/www
sudo git clone https://github.com/your-username/subsystem2.git warehouse
cd /var/www/warehouse

# Set permissions
sudo chown -R www-data:www-data /var/www/warehouse
sudo chmod -R 775 /var/www/warehouse/storage /var/www/warehouse/bootstrap/cache

# Install dependencies and build assets
composer install --no-dev --optimize-autoloader
npm ci
npm run build

# Configure .env
cp .env.example .env
nano .env
```
In your `.env` on the server:
```env
APP_NAME="Warehouse Inventory & Delivery System"
APP_ENV=production
APP_DEBUG=false
APP_URL=http://159.223.x.x

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=warehouse_db
DB_USERNAME=warehouse_user
DB_PASSWORD=YourSuperSecretPassword123!
```
Run migrations and import your initial data:
```bash
php artisan key:generate
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

#### Step 6: Configure Nginx Web Server
Create Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/warehouse
```
Paste this configuration:
```nginx
server {
    listen 80;
    server_name 159.223.x.x;
    root /var/www/warehouse/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php index.html;
    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```
Enable the site and restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/warehouse /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```
**Done!** Both laptops and any device can visit `http://159.223.x.x` (or your free student domain) anytime 24/7.

---

## 5. Method 4: Free Cloud MySQL via TiDB Serverless ($0 Forever, No Credit Card)

If you prefer having both laptops run the code locally, but want them to share **one cloud database without paying anything**:

### Why TiDB Serverless:
- **Compatibility:** 100% compatible with MySQL syntax.
- **Cost:** **$0.00 forever** (Free tier gives 5 GB storage and 50 million request units free every month).
- **Credit Card:** **No credit card required to sign up**.

### Step-by-Step Instructions:

#### Step 1: Create a Free TiDB Database
1. Go to **[pingcap.com/tidb-cloud](https://www.pingcap.com/tidb-cloud/)** and sign up with Google/GitHub.
2. Create a cluster: Select **Serverless (Free)**.
3. Select your region (e.g. AWS Singapore or Tokyo for low latency).
4. Set root password and create the cluster.

#### Step 2: Get your Connection Details
TiDB provides connection details like:
- **Host:** `gateway01.ap-southeast-1.prod.aws.tidbcloud.com`
- **Port:** `4000`
- **User:** `xxxx.root`
- **Password:** `YourPassword`

#### Step 3: Update `.env` on Both Laptops
On **both** Laptop A and Laptop B, update `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
DB_PORT=4000
DB_DATABASE=test
DB_USERNAME=xxxx.root
DB_PASSWORD=YourPassword
MYSQL_ATTR_SSL_CA=true
```

#### Step 4: Run Migrations on Laptop A
```powershell
php artisan migrate
```
**Done!** When Laptop A or Laptop B makes any change locally, it instantly writes to the TiDB cloud database. Both laptops stay 100% in sync without running any server.

---

## 6. Summary Comparison Table

| Method | Upfront Cost | Monthly Cost | Credit Card? | Best Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Method 1: Cloudflare Tunnel** | **$0.00** | **$0.00 Forever** | **NO** | **Top Choice:** 3-minute setup, works anywhere, instant HTTPS link. |
| **Method 2: Tailscale** | **$0.00** | **$0.00 Forever** | **NO** | Private, secure direct connection between your 2 laptops. |
| **Method 3: GitHub Student Pack** | **$0.00** | **$0.00 (Covered)**| **NO** | Real 24/7 Ubuntu VPS for school defenses & capstone presentations. |
| **Method 4: TiDB Cloud MySQL** | **$0.00** | **$0.00 Forever** | **NO** | Keep code on laptops, but share 1 cloud database for free. |

---

## Recommended Quick Start
For immediate results right now with zero headache:
👉 **Use Method 1 (Cloudflare Tunnel)**. You already have XAMPP and Laravel working. In 1 command (`cloudflared tunnel --url http://localhost:8000`), you get a free live web address that you can send to Laptop B, your groupmates, or professors to test the system live.
