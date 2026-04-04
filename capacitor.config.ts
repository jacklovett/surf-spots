import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.surfspots.app',
  appName: 'Surf Spots',
  webDir: 'public',
  ios: { path: 'mobile/ios' },
  android: { path: 'mobile/android' },
  server: {
    // Physical device: set to your PC's LAN IP (e.g. http://192.168.1.100:5173). Get IP: ipconfig (Windows) or ifconfig (Mac).
    // Emulator: use http://10.0.2.2:5173 (Android) or http://localhost:5173 (iOS). Override with CAPACITOR_SERVER_URL env var.
    url: process.env.CAPACITOR_SERVER_URL || 'http://192.168.1.4:5173',
    cleartext: true,
  },
}

export default config
