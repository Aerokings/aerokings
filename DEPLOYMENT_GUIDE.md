# 🚀 AeroKings Deployment Guide

## www.aerokings.ae - Housemaid Recruitment Website

---

## Step 1: Set Up Supabase (Free Database)

1. Go to [supabase.com](https://supabase.com) and sign up / log in
2. Click **"New Project"**
3. Fill in:
   - **Name:** `aerokings`
   - **Database Password:** (save this somewhere safe!)
   - **Region:** Choose closest to Dubai (e.g., `West Asia (Mumbai)`)
4. Wait for the project to be created (~2 minutes)

### Get Your Keys
1. Go to **Settings → API** in your Supabase dashboard
2. Copy these two values:
   - **Project URL** → e.g., `https://xxxx.supabase.co`
   - **anon public key** → a long string starting with `eyJ...`

### Create the Database
1. Go to **SQL Editor** in Supabase
2. Click **"New Query"**
3. Open the file `supabase/schema.sql` from this project
4. Copy ALL the content and paste it into the SQL editor
5. Click **"Run"**
6. You should see "Success" — this creates the maids table, storage bucket, and sample data

---

## Step 2: Set Up Vercel (Free Hosting)

1. Go to [vercel.com](https://vercel.com) and sign up with **GitHub**
2. Push this project to a **GitHub repository**:
   ```bash
   # In your terminal, inside this project folder:
   git init
   git add .
   git commit -m "Initial AeroKings deployment"
   
   # Create a new repo on GitHub, then:
   git remote add origin https://github.com/YOUR_USERNAME/aerokings.git
   git branch -M main
   git push -u origin main
   ```
3. Back on Vercel, click **"Add New → Project"**
4. Select your `aerokings` repository
5. In **Environment Variables**, add:

   | Variable | Value |
   |----------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
   | `NEXT_PUBLIC_ADMIN_PASSWORD` | Choose a secure password for admin access |
   | `NEXT_PUBLIC_WHATSAPP_NUMBER` | `971567554232` |

6. Click **"Deploy"**
7. Wait for the build to complete (~2-3 minutes)
8. Your site will be live at `https://aerokings.vercel.app` 🎉

---

## Step 3: Connect Your Domain (aerokings.ae)

### On Vercel:
1. Go to your project → **Settings → Domains**
2. Add `www.aerokings.ae`
3. Add `aerokings.ae`
4. Vercel will show you the DNS records to configure

### On Namecheap:
1. Log in to [namecheap.com](https://namecheap.com)
2. Go to **Domain List → Manage** for `aerokings.ae`
3. Go to **Advanced DNS**
4. Remove any existing records (except nameserver records)
5. Add these records:

   | Type | Host | Value | TTL |
   |------|------|-------|-----|
   | **A** | `@` | `76.76.21.21` | Automatic |
   | **CNAME** | `www` | `cname.vercel-dns.com.` | Automatic |

6. Save changes
7. DNS propagation takes **5-30 minutes** (sometimes up to 24 hours)

### Verify on Vercel:
1. Go back to Vercel → Settings → Domains
2. Both domains should show a green checkmark ✅
3. SSL certificate is automatically provisioned by Vercel

---

## Step 4: Test Everything

1. Visit **www.aerokings.ae** — you should see the maid listing
2. Test the filters (nationality, category, location)
3. Click **"View Profile"** on any maid
4. Test the **WhatsApp** button
5. Test the **Book** button → you should see confirmation + chatbot
6. Click **Admin** tab → enter your admin password
7. Test adding, editing, deleting maids
8. Test photo upload

---

## 🔧 Maintenance

### Change Admin Password
Update the `NEXT_PUBLIC_ADMIN_PASSWORD` environment variable in Vercel → Settings → Environment Variables, then redeploy.

### Add New Maids
- **Admin Panel:** Go to www.aerokings.ae → Admin tab → Add New
- **Email Automation:** The email trigger in Tasklet still works — forward maid profiles to recruitersrace@gmail.com

### Update the Website
1. Make changes to the code
2. Push to GitHub: `git add . && git commit -m "Update" && git push`
3. Vercel auto-deploys within 1-2 minutes

---

## 📁 Project Structure

```
aerokings/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # HTML layout & metadata
│   │   ├── page.tsx            # Main page component
│   │   └── globals.css         # Styles
│   ├── components/
│   │   ├── Header.tsx          # Navigation header
│   │   ├── FilterBar.tsx       # Search & filter controls
│   │   ├── MaidCard.tsx        # Maid listing card
│   │   ├── MaidGrid.tsx        # Grid of maid cards
│   │   ├── MaidDetail.tsx      # Full profile modal
│   │   ├── AdminPanel.tsx      # Admin CRUD panel
│   │   └── ChatBot.tsx         # Post-booking chatbot
│   ├── lib/
│   │   └── supabase.ts         # Supabase client setup
│   ├── types.ts                # TypeScript types
│   └── utils/
│       └── helpers.ts          # Helper functions & constants
├── supabase/
│   └── schema.sql              # Database schema & sample data
├── package.json
├── tailwind.config.js
├── next.config.js
└── DEPLOYMENT_GUIDE.md         # This file!
```

---

## ❓ Troubleshooting

| Problem | Solution |
|---------|----------|
| Blank page | Check Supabase URL and anon key in Vercel env vars |
| Photos not showing | Run the storage bucket SQL from schema.sql |
| Admin password not working | Check NEXT_PUBLIC_ADMIN_PASSWORD env var |
| Domain not working | Wait 24h for DNS, check Namecheap records match Vercel |
| Build errors | Check Vercel deployment logs for specific errors |

---

**Need help?** The Tasklet agent that built this can assist with any issues! 🎯
