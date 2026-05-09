import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";

/**
 * PWA shell — injected into every web page.
 * Adds manifest, theme colour, apple touch icon, and the install banner prompt.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />

        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0a0a1a" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Sleepless" />
        <link rel="apple-touch-icon" href="/icon-192.png" />

        {/* SEO */}
        <title>Sleepless — South Africa's Events App</title>
        <meta
          name="description"
          content="Discover and book events across all 9 provinces of South Africa. Concerts, festivals, comedy shows and more."
        />

        {/* Fonts — match the app exactly */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Pacifico&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />

        <ScrollViewStyleReset />

        <style dangerouslySetInnerHTML={{
          __html: `
            * { box-sizing: border-box; }
            html, body, #root { height: 100%; background: #0a0a1a; }
            body { margin: 0; font-family: 'DM Sans', sans-serif; -webkit-font-smoothing: antialiased; }

            /* PWA install banner */
            #pwa-install-banner {
              display: none;
              position: fixed;
              bottom: 24px;
              left: 50%;
              transform: translateX(-50%);
              background: #1a1a35;
              border: 1px solid rgba(107,33,168,0.4);
              border-radius: 16px;
              padding: 14px 20px;
              z-index: 99999;
              align-items: center;
              gap: 14px;
              box-shadow: 0 8px 32px rgba(0,0,0,0.5);
              width: calc(100% - 32px);
              max-width: 420px;
            }
            #pwa-install-banner.show { display: flex; }
            #pwa-install-banner .pwa-icon { font-size: 32px; flex-shrink: 0; }
            #pwa-install-banner .pwa-text { flex: 1; }
            #pwa-install-banner .pwa-title { color: #fff; font-weight: 600; font-size: 14px; }
            #pwa-install-banner .pwa-sub { color: rgba(255,255,255,0.55); font-size: 12px; margin-top: 2px; }
            #pwa-install-banner button {
              background: #6B21A8; color: #fff; border: none; border-radius: 10px;
              padding: 10px 18px; font-size: 13px; font-weight: 600; cursor: pointer;
              font-family: 'DM Sans', sans-serif; white-space: nowrap;
            }
            #pwa-dismiss { background: transparent !important; color: rgba(255,255,255,0.4) !important;
              padding: 8px !important; font-size: 18px !important; }
          `
        }} />
      </head>
      <body>
        {children}

        {/* PWA install banner */}
        <div id="pwa-install-banner">
          <div className="pwa-icon">📱</div>
          <div className="pwa-text">
            <div className="pwa-title">Add Sleepless to Home Screen</div>
            <div className="pwa-sub">Install the app for the best experience</div>
          </div>
          <button id="pwa-install-btn">Install</button>
          <button id="pwa-dismiss" className="pwa-dismiss">✕</button>
        </div>

        <script dangerouslySetInnerHTML={{
          __html: `
            // PWA install prompt
            let deferredPrompt;
            window.addEventListener('beforeinstallprompt', (e) => {
              e.preventDefault();
              deferredPrompt = e;
              const banner = document.getElementById('pwa-install-banner');
              if (banner) banner.classList.add('show');
            });
            document.getElementById('pwa-install-btn')?.addEventListener('click', async () => {
              if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                deferredPrompt = null;
                document.getElementById('pwa-install-banner')?.classList.remove('show');
              }
            });
            document.getElementById('pwa-dismiss')?.addEventListener('click', () => {
              document.getElementById('pwa-install-banner')?.classList.remove('show');
            });

            // Register service worker
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js').catch(() => {});
              });
            }
          `
        }} />
      </body>
    </html>
  );
}
