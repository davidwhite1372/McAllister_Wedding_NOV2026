# Laura & Alex Wedding Trip PWA

A beautiful, offline-capable Progressive Web App for your November 2026 wedding trip.

## Features

- **Timeline** – Full day-by-day schedule (Nov 5–8)
- **Flights** – Outbound UA 1576 & return UA 777 with confirmation codes, seats, and quick links
- **Hotels** – Both Tempo by Hilton Manassas reservations with confirmation numbers
- **Wedding** – Ceremony, reception, shuttle times, afterparty details + map links
- **Packing** – Interactive checklist that saves your progress
- **Countdown** – Live days-until-wedding counter
- **Installable** – Add to home screen on Android (and iOS)
- **Offline** – Works without internet after first load

## How to Install on Android

1. Open the app in **Chrome** (or any Chromium browser).
2. Tap the menu (⋮) → **“Install app”** or **“Add to Home screen”**.
3. Or wait for the install banner that appears at the bottom.
4. The app will open in full-screen standalone mode.

### Alternative: Serve locally

If you have the files on your computer:

```bash
cd wedding-trip-pwa
python3 -m http.server 8080
```

Then open `http://YOUR_PHONE_IP:8080` on your phone (same Wi-Fi) and install.

## Files

```
wedding-trip-pwa/
├── index.html
├── manifest.json
├── sw.js                 # Service worker (offline)
├── css/styles.css
├── js/app.js
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
└── README.md
```

Enjoy the wedding! 💍
