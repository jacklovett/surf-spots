# Deploy to Vercel in 5 Minutes (FREE & EASY!)

## Why Vercel?
✅ Built for React Router v7 / Remix / Next.js  
✅ Zero configuration needed  
✅ Automatic serverless functions  
✅ Global edge network  
✅ 100% FREE for personal projects  

---

## Step 1: Go to Vercel
Open your browser and go to: **https://vercel.com/signup**

## Step 2: Sign Up with GitHub
- Click "Continue with GitHub"
- Authorize Vercel (it's safe, they just read your repos)

## Step 3: Import Your Project
1. Click **"Add New..."** → **"Project"**
2. Click **"Import"** next to your **"Surf Spots"** repository
3. If you don't see it, click "Adjust GitHub App Permissions" and grant access

## Step 4: Configure Project Settings

### Root Directory
- Set **Root Directory** to: `surf-spots`
- Click "Edit" next to "Root Directory" and type `surf-spots`

### Framework Preset
- Vercel should auto-detect "Other"
- **Leave it as is** (React Router works best without a preset)

### Build Settings
Vercel should auto-detect these, but verify:
- **Build Command:** `npm run build`
- **Output Directory:** `build/client`
- **Install Command:** `npm install`

## Step 5: Add Environment Variables (IMPORTANT!)

Click on **"Environment Variables"** and add these:

### Required Variables:

1. **VITE_API_URL**
   - Value: `https://your-backend-api-url.com/api` (your Java backend URL)

2. **SESSION_SECRET**
   - Value: Generate a random string (at least 32 characters)
   - Example: `your-super-secret-session-key-min-32-chars-long`

### Optional Variables (if using OAuth):

3. **GOOGLE_CLIENT_ID** (if using Google login)
   - Value: Your Google OAuth client ID

4. **GOOGLE_CLIENT_SECRET**
   - Value: Your Google OAuth client secret

5. **GOOGLE_CALLBACK_URL**
   - Value: `https://your-app.vercel.app/auth/google` (update after deployment)

6. **FACEBOOK_CLIENT_ID** (if using Facebook login)
   - Value: Your Facebook app ID

7. **FACEBOOK_CLIENT_SECRET**
   - Value: Your Facebook app secret

8. **FACEBOOK_CALLBACK_URL**
   - Value: `https://your-app.vercel.app/auth/facebook` (update after deployment)

9. **BASE_URL**
   - Value: `https://your-app.vercel.app` (update after deployment)

10. **VITE_MAP_ACCESS_TOKEN**
    - Value: Your Mapbox public access token

**Note:** For OAuth callback URLs and BASE_URL, you can add placeholder values first, deploy, then update them with your actual Vercel URL.

## Step 6: Deploy! 🚀

1. Click **"Deploy"**
2. Wait 2-3 minutes for the build
3. Get your live URL: `https://your-app-name.vercel.app`

---

## Step 7: Update OAuth Callback URLs (If Using)

After your first deployment, you'll have a URL like `https://surf-spots-xyz123.vercel.app`

### Update Environment Variables:
1. Go to your project in Vercel Dashboard
2. Click **Settings** → **Environment Variables**
3. Update these with your actual URL:
   - `BASE_URL`: `https://surf-spots-xyz123.vercel.app`
   - `GOOGLE_CALLBACK_URL`: `https://surf-spots-xyz123.vercel.app/auth/google`
   - `FACEBOOK_CALLBACK_URL`: `https://surf-spots-xyz123.vercel.app/auth/facebook`

### Update OAuth Provider Settings:
1. **Google Cloud Console:**
   - Add `https://surf-spots-xyz123.vercel.app/auth/google` to Authorized redirect URIs

2. **Facebook Developers:**
   - Add `https://surf-spots-xyz123.vercel.app/auth/facebook` to Valid OAuth Redirect URIs

3. Redeploy from Vercel dashboard (or push a new commit)

---

## That's It! 🎉

Your site is now live at: `https://your-app-name.vercel.app`

### What Happens Next?
- ✅ Every push to GitHub auto-deploys
- ✅ Preview deployments for pull requests
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Zero maintenance

---

## Custom Domain (Optional)

Want your own domain like `surfspots.com`?

1. Go to your project in Vercel
2. Click **Settings** → **Domains**
3. Add your domain
4. Update your domain's DNS (Vercel shows you exactly what to do)
5. Done! Automatic HTTPS included.

---

## Troubleshooting

### Build Fails?
- Check the build logs in Vercel dashboard
- Verify all environment variables are set
- Make sure `surf-spots` is set as the root directory

### OAuth Not Working?
- Verify callback URLs match exactly (including https://)
- Check that all OAuth environment variables are set
- Ensure OAuth providers have the Vercel URL whitelisted

### Need Backend First?
See `../surf-spots-api/SCALEWAY_DEPLOY.md` to deploy your Java backend first.

---

## Why Vercel Over Netlify?

✅ **Better React Router v7 Support:** Built-in compatibility  
✅ **Automatic Functions:** No manual serverless setup needed  
✅ **Faster Edge Network:** Better global performance  
✅ **Better Developer Experience:** Cleaner dashboard and logs  
✅ **Preview Deployments:** Automatic preview URLs for PRs  

---

## Cost

**100% FREE for:**
- Personal projects
- Unlimited deployments
- Automatic HTTPS
- Global CDN
- Edge functions
- 100 GB bandwidth/month
- 6000 build minutes/month

That's more than enough for your surf spots app! 🏄‍♂️

