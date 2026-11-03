# FixCan

Point your camera at a hardware component. FixCan identifies it, checks for visible damage, and walks you through the repair. Built for the Meta Hackathon.

## Stack

- Expo SDK 58 + React Native 0.88 + TypeScript (strict)
- Expo Router (file-based navigation, typed routes)
- Zustand + AsyncStorage (local-first persistence)
- expo-camera / expo-image-picker / expo-file-system
- i18next (English default, Spanish switchable)
- Llama multimodal integration behind a mock/live boundary

## Run it

```bash
npm install
npx expo start
```

Then scan the QR code with Expo Go, or press `a` / `i` / `w` for Android, iOS, or web.

### Open it on your phone (Windows)

Double-click **`FixCan-Mobile-QR.bat`**. It checks Node.js, installs dependencies the first time, starts the Expo dev server, and shows the QR code in the terminal. Scan that QR with Expo Go and FixCan opens on your phone.

The script asks for a connection mode:

1. **LAN** — phone and PC on the same Wi-Fi (fastest, recommended for the demo).
2. **Tunnel** — different networks; uses anonymous ngrok, no Expo account needed.

On macOS/Linux the same thing is the **`FixCan-Mobile-QR.sh`** script:

```bash
./FixCan-Mobile-QR.sh
```

Or just run `npx expo start` (add `--tunnel` when the phone is on another network).

Useful checks:

```bash
npm run typecheck
npm run lint
npm run doctor
```

## Demo flow

1. Welcome screen — tap **Continue with email** (or Facebook / guest). Auth is mocked in this build.
2. **History** opens with five seeded demo scans, grouped by date and filterable.
3. Tap any scan to open the detail screen: photo/artwork, brand, model, specs, description, damage findings, and a step-by-step repair plan.
4. Tap **Ask Assistant** to jump to the Assistant tab with that scan in context. Ask about tools, safety, cost, or whether it is worth repairing.
5. Tap the avatar (top right) to open **Profile**: language (EN/ES), appearance, local data, and sign out.

The camera tab is a full-screen capture experience: shutter, flash, flip, gallery import, framing overlay, and an analysis progress overlay. On web, the camera falls back to gallery import when no camera is available.

## AI modes

Mock mode is the default so the demo always works offline:

```bash
EXPO_PUBLIC_AI_MODE=mock
```

Live mode sends the captured image to a proxy you control:

```bash
EXPO_PUBLIC_AI_MODE=live
EXPO_PUBLIC_AI_PROXY_URL=https://your-proxy.example.com/analyze
```

The proxy receives `{ imageBase64, mimeType, locale }` and must return:

```json
{
  "analysis": {
    "component": {
      "name": "GeForce RTX 4070 Ti",
      "brand": "ASUS",
      "model": "TUF Gaming OC 12GB",
      "category": "gpu",
      "specs": [{ "label": "Memory", "value": "12 GB GDDR6X" }],
      "description": "…",
      "confidence": 0.94,
      "identifiers": { "partNumber": "…" }
    },
    "damage": {
      "detected": true,
      "summary": "…",
      "severity": "moderate",
      "findings": [
        {
          "type": "dust",
          "description": "…",
          "location": "…",
          "confidence": 0.9
        }
      ]
    },
    "repair": {
      "repairability": "partial",
      "difficulty": "moderate",
      "estimatedTime": "45–60 min",
      "estimatedCost": { "min": 0, "max": 35, "currency": "USD" },
      "tools": ["…"],
      "steps": [{ "title": "…", "detail": "…", "safety": "…" }],
      "warnings": ["…"],
      "whenToSeekPro": ["…"]
    }
  },
  "model": "llama-4-maverick"
}
```

Responses are validated with Zod (`src/ai/schema.ts`). If the live call fails, the app falls back to demo data so the flow never breaks.

## Project layout

```
src/
  app/            # Expo Router routes
    (tabs)/       # History, Scan (camera), Assistant
    scan/[id].tsx # Scan detail
    profile.tsx   # Modal profile/settings
    welcome.tsx   # Mock sign-in
  ai/             # Mock/live analysis boundary + Zod contract
  components/     # UI primitives and scan artwork
  data/           # Bilingual demo scans
  i18n/           # EN/ES translations
  lib/            # Images, dates, formatting, assistant replies
  store/          # Zustand stores (settings, scans, chat)
  theme/          # Colors, spacing, typography, light/dark mode
  types/          # Shared domain types
```

## Notes

- Language is English by default and persists. Switching to Spanish also re-localizes seeded demo scans.
- Demo scans are seeded once; deleting all scans leaves History empty on purpose.
- Photos are copied into the app document directory on native. Demo mode never uploads images.
- Data stays on the device via AsyncStorage; no backend is required for the hackathon build.
