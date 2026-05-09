# Deploying Sleepless as a PWA to sleeplessapp.co.za

## Build the web app
```bash
cd sleepless-app
pnpm install
npx expo export --platform web
```
This creates a `dist/` folder with the full compiled web app.

## Upload to Xneelo
1. Open Xneelo Konsole → cPanel → File Manager → public_html
2. Delete any existing files in public_html
3. Upload ALL files from your local `dist/` folder to public_html
4. Upload `public/manifest.json` to public_html
5. Upload `public/sw.js` to public_html

## That's it
Visit sleeplessapp.co.za — the app loads like a website.
On mobile, users will see "Add to Home Screen" to install it as an app.

## Environment variables on Xneelo
Create a `.env` file in public_html or set via cPanel → Softaculous:
```
EXPO_PUBLIC_API_URL=https://sleeplessapp.co.za
EXPO_PUBLIC_PAYFAST_MERCHANT_ID=34812391
EXPO_PUBLIC_PAYFAST_MERCHANT_KEY=grvghx5kh378h
```

## Backend (Node.js server)
Xneelo shared hosting does NOT support Node.js.
You have two options:
1. Deploy the backend separately on Railway, Render, or Heroku (free tier)
   - Push server/ folder there
   - Set EXPO_PUBLIC_API_URL to that URL
2. Upgrade to Xneelo VPS which supports Node.js
