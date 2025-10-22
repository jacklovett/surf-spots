# Deploy to Netlify in 5 Minutes (FREE & EASY!)

> **⚠️ NOTE:** This project now uses Vercel for better React Router v7 support.  
> **See `VERCEL_DEPLOY.md` for the recommended deployment method.**
>
> This guide is kept for reference but may not work with React Router v7.

---

# Deploy to Netlify (LEGACY)

## Step 1: Go to Netlify
Open your browser and go to: **https://app.netlify.com/signup**

## Step 2: Sign Up with GitHub
- Click "Sign up with GitHub"
- Authorize Netlify (it's safe, they just read your repos)

## Step 3: Import Your Project
1. Click the big **"Add new site"** button
2. Click **"Import an existing project"**
3. Click **"Deploy with GitHub"**
4. Find and click your **"Surf Spots"** repository
5. If you don't see it, click "Configure Netlify on GitHub" and give it access

## Step 4: Configure Build Settings
Netlify should auto-detect everything, but verify:
- **Base directory:** `surf-spots`
- **Build command:** `npm run build`
- **Publish directory:** `surf-spots/build/client`

Click **"Deploy"**

## Step 5: Add Environment Variables (IMPORTANT!)
1. After deployment, go to **Site configuration** → **Environment variables**
2. Add these variables:

**Required:**
- Variable: `VITE_API_URL`
  - Value: `https://your-backend-api-url.com/api` (your Java backend URL)

- Variable: `SESSION_SECRET`
  - Value: Generate a random string (or use: `my-super-secret-key-12345`)

3. Click **"Save"**
4. Go to **Deploys** tab and click **"Trigger deploy"** → **"Deploy site"**

## Step 6: Done! 🎉
Your site will be live at: `https://your-site-name.netlify.app`

---

## That's It!
- Every time you push to GitHub, Netlify auto-deploys
- 100% FREE for your needs
- Custom domain? Add it in Site settings → Domain management

## Need to Deploy Your Backend First?
See **`../surf-spots-api/SCALEWAY_DEPLOY.md`** for instructions to deploy your Java backend to Scaleway.

Once your backend is deployed, come back here and use the Scaleway backend URL as your `VITE_API_URL`.

