# Royal Ledger

A yearly expense tracker for phone and desktop.

## Features
- Add expenses with amount, category, note and date
- Monthly budget with progress bar
- Month report and Year report: totals, averages, costliest day/month,
  charts, category ranking and change versus the previous period
- Report banners at the end of each month and the end of the year
- Add or remove your own expense categories
- Change theme colour, font and light/dark mode
- Installable on your phone (PWA) and works offline after the first load

## Files
- index.html – page structure
- style.css – all styling
- app.js – app logic (data saved in the browser's localStorage)
- manifest.json, sw.js, icon-192.png, icon-512.png – install and offline support
- logo-1024.png – full-size logo

## Run locally
Open index.html, or for install/offline support run:

    python3 -m http.server 8000

then visit http://localhost:8000

## Put it online (free)
Upload this whole folder to Netlify Drop, GitHub Pages or Cloudflare Pages.
Open the link on your phone and choose "Add to Home Screen".

## Make an Android APK
Host the site, then paste its link into pwabuilder.com and choose Android.

## Notes
- Data stays in each device's browser. There is no sync between devices.
- The "Smart saving ideas" button uses Claude and only works inside claude.ai.
  Elsewhere it shows a message. To enable it on your own site, call the Claude
  API from a small backend and never put your API key in app.js.
