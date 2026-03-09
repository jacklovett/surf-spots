# Mobile (Capacitor)

The app runs in a native shell via [Capacitor](https://capacitorjs.com). The WebView loads the **existing SSR app** from a URL—no SPA conversion.

**Layout:** All native projects live under **`mobile/`** so they're clearly separate from the web app. The rest of the repo (e.g. `app/`, `public/`) is shared between web and mobile.

## How to run on mobile (quick start)

From the **project root** (`c:\dev\surf-spots`):

**Do I need the frontend running?** Yes. The mobile app is a shell that loads your app from a URL. In dev that URL is your dev server. If `npm run dev` isn't running, the app will be blank or show an error.

1. **One-time setup**
   - `npm install`
   - `npx cap add ios` and/or `npx cap add android` (if not done yet)
   - `npm run cap:sync`

2. **Each time you want to run**
   - **Terminal 1:** `npm run dev` — leave it running.
   - **Terminal 2:** `npx cap run android` or `npx cap run ios`. For Android, start an emulator first (see below) or connect a device—otherwise you'll see "No devices found."
   - (Using a **physical device**? See "Run on a real phone" below.)

---

## How do I start an emulator?

**Android (Windows/Mac/Linux)**  
- **GUI:** Android Studio → **Tools** → **Device Manager**. Create a device once if needed, then click **Play** to start it.  
- **CLI:** `emulator -list-avds` lists AVD names; `emulator -avd <name>` starts one. Binary is in the SDK (`%ANDROID_HOME%\emulator\emulator.exe` on Windows, `$ANDROID_HOME/emulator/emulator` on Mac/Linux). Add that folder to PATH or use the full path.  
- Create a virtual device once if you don’t have one: **Create Device** → pick a phone → pick a system image (e.g. API 34) → Finish.  
- Click the **Play** button next to the device to start the emulator. Leave it running.  
- From the project root: **Terminal 1** `npm run dev`, **Terminal 2** `npx cap run android`. Capacitor installs and runs the app on the emulator.

**"No devices found" but I started an emulator / it said one is already running**  
Capacitor uses `adb` to see devices. The "multiple emulators" FATAL is the emulator **refusing to start a second copy** of the same AVD—it doesn't mean adb sees the first one. So you can end up with: (1) no emulator window open, or (2) emulator open but adb not seeing it.  
- Check: run `adb devices` (SDK `platform-tools` folder, or ensure it's on PATH). If the list is empty or the device shows `offline`, adb isn't seeing a usable device.  
- Fix: Close any emulator window. Run `adb kill-server`, then `adb start-server`. Start **one** emulator (GUI or `emulator -avd <name>`), wait until the home screen is fully up, then run `adb devices` again—you should see `emulator-5554   device`. Then run `npx cap run android`.

**iOS (Mac only)**  
- Install **Xcode** and open it once so it installs simulators.  
- From the project root: **Terminal 1** `npm run dev`, **Terminal 2** `npx cap run ios`. This usually starts the default simulator and opens the app.  
- Or start a simulator yourself: **Xcode** → **Window** → **Devices and Simulators** → **Simulators** → select one and run it, then `npx cap run ios`.

---

## Run on a real phone

**Android**  
1. On the phone: **Settings** → **About phone** → tap **Build number** 7 times (enables Developer options).  
2. **Settings** → **Developer options** → turn on **USB debugging**.  
3. Connect the phone with USB. Allow debugging when prompted.  
4. Your phone and PC must be on the **same Wi‑Fi**. Find your PC’s IP (Windows: `ipconfig` → IPv4; Mac: System Settings → Network).  
5. In the project root, set the dev server URL and sync (replace `192.168.1.100` with your PC’s IP):
   - Edit `capacitor.config.ts`: set `server: { url: 'http://192.168.1.100:5173' }` (or use `CAPACITOR_SERVER_URL` when running).
   - Run `npm run cap:sync`.  
6. **Terminal 1:** `npm run dev`. **Terminal 2:** `npx cap run android`. Pick your phone when asked. The app will load from your PC’s dev server.

**iOS (Mac only)**  
1. Connect the iPhone with USB. Trust the computer if prompted.  
2. Same Wi‑Fi as your Mac. Find the Mac’s IP (System Settings → Network).  
3. In the project: set `server.url` in `capacitor.config.ts` to `http://YOUR_MAC_IP:5173`, then `npm run cap:sync`.  
4. **Terminal 1:** `npm run dev`. **Terminal 2:** `npx cap run ios`. Select your iPhone as the target. The app will load from your Mac’s dev server.

## Prerequisites

- Node 20+
- **iOS:** Xcode (macOS only)
- **Android:** Android Studio and SDK

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Add native platforms (one-time). These are created under `mobile/ios` and `mobile/android`:
   ```bash
   npx cap add ios
   npx cap add android
   ```

3. Sync web assets into native projects:
   ```bash
   npm run cap:sync
   ```
   or `npx cap sync`

## Running the app

### Development (load from dev server)

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. **Emulator URL notes:**
   - **Android emulator:** use `http://10.0.2.2:5173` (this is the default fallback in `capacitor.config.ts`).
   - **iOS simulator:** `http://localhost:5173` usually works.

3. **Physical device:** Use your computer's LAN IP (e.g. `http://192.168.1.100:5173`).
   - Windows: `ipconfig` → IPv4 Address
   - Mac: System Settings → Network, or `ifconfig`

4. Set the URL and run:
   - **Windows (PowerShell):**
     ```powershell
     $env:CAPACITOR_SERVER_URL = "http://YOUR_IP:5173"
     npx cap run android
     ```
   - **Mac (iOS):**
     ```bash
     CAPACITOR_SERVER_URL=http://YOUR_IP:5173 npx cap run ios
     ```
   Or edit `server.url` in `capacitor.config.ts` to your IP, then:
   ```bash
   npm run cap:sync
   npx cap run android
   npx cap run ios
   ```

5. Open in IDE (for debugging):
   ```bash
   npm run cap:open:ios
   npm run cap:open:android
   ```

### Production (load from deployed app)

Set `server.url` in `capacitor.config.ts` to your deployed URL (e.g. `https://surf-spots-five.vercel.app`), or set `CAPACITOR_SERVER_URL` when running. Then:

```bash
npm run cap:sync
npx cap run ios
npx cap run android
```

## Config

| Item | Purpose |
|------|--------|
| `capacitor.config.ts` (root) | App id, name, `webDir`, `server.url`, and paths to native projects. |
| `mobile/ios` | Xcode project (created by `cap add ios`). |
| `mobile/android` | Android Studio project (created by `cap add android`). |
| `server.url` | Where the WebView loads the app (dev server or production URL). |
| `webDir: 'public'` | Folder synced into native projects; main UI comes from `server.url`. |

## Workflow

- **After app code changes:** Refresh the WebView; no `cap sync` needed (content is from the URL).
- **After changing `capacitor.config.ts` or adding plugins:** Run `npm run cap:sync`, then run or open the native app again.

## Pre-commit checklist (mobile)

- Run `npm run cap:sync` and ensure no unexpected diffs are produced.
- Verify native projects open (`npm run cap:open:android`, `npm run cap:open:ios` on macOS).
- Confirm `mobile/android/local.properties`, `build/`, and IDE workspace files are not staged.
- Keep `.env` out of git (already ignored at repo root).

## Replacing default Capacitor branding assets

Capacitor currently uses generated defaults for app icon/splash assets in native projects.

- **Android defaults:** `mobile/android/app/src/main/res/drawable/ic_launcher_background.xml` and `mobile/android/app/src/main/res/drawable-v24/ic_launcher_foreground.xml`
- **iOS defaults:** `mobile/ios/App/App/Assets.xcassets/AppIcon.appiconset` and `mobile/ios/App/App/Assets.xcassets/Splash.imageset`

### What are these assets?

- **`ic_launcher` (Android) / App Icon (iOS)** — The **app icon**: what users see on the home screen, in the app drawer, and in the task switcher. Generated from the **icon-only** asset (no text), so it stays readable at small sizes.
- **`splash`** — The **splash screen**: full-screen image shown while the native shell loads and the WebView starts. Shown only for a short time at launch.

### Why so many files?

Android and iOS require many **resolutions and variants** for different devices and contexts:

- **Screen densities** (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi on Android; 1x, 2x, 3x on iOS).
- **Orientations** (portrait vs landscape for splash).
- **Android adaptive icon** (foreground + background layers, round vs square).
- **Dark mode** (optional separate splash/icon).

The generator takes one or two source images (e.g. `assets/icon-only.svg` and `assets/logo.svg`) and produces all of these. You don't create them by hand.

### Recommended approach

1. **App icon:** Uses `assets/logo.svg` (icon-only mark: circle + wave, no "SURF SPOTS" text). A copy of the full logo with text is in `assets/splash.svg` for reference.
2. **Splash:** Uses `assets/splash.svg` (full logo with text). Background color is set in the `cap:assets` script (`#046380`).
3. Generate native assets:
   ```bash
   npm run cap:assets
   ```
4. Re-sync and run:
   ```bash
   npm run cap:sync
   npx cap run android
   ```

## Next phases

- **Phase 2:** One native capability (e.g. camera).
- **Phase 3:** Push notifications, geolocation.
- **Phase 4:** Offline caching/sync.
