/**
 * Run after: npx expo export --platform web
 * Usage: node patch-web.js
 */
const fs = require("fs");
const path = require("path");

const indexPath = path.join(__dirname, "dist", "index.html");
let html = fs.readFileSync(indexPath, "utf8");

const injection = `
  <!-- Sleepless font + icon + interaction patch -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Pacifico&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
  <style>
    /* Fix Pacifico logo */
    [data-sleepless-logo], .sleepless-logo {
      font-family: 'Pacifico', cursive !important;
    }

    /* CRITICAL: Fix unpressable buttons on web */
    /* Ensure all interactive elements are clickable */
    div[role="button"],
    div[tabindex],
    [data-focusable="true"] {
      cursor: pointer !important;
      pointer-events: auto !important;
      position: relative !important;
      z-index: 1 !important;
    }

    /* Fix gradient background not blocking clicks */
    #root > div > div:first-child {
      pointer-events: none !important;
    }

    /* Re-enable clicks on actual content */
    #root > div > div:first-child > * {
      pointer-events: auto !important;
    }

    /* Ensure SVG icons don't block clicks */
    svg {
      pointer-events: none !important;
    }

    /* Fix React Native web pressable */
    .r-cursor-1iuazoz {
      cursor: pointer !important;
    }
  </style>
`;

html = html.replace("</head>", injection + "</head>");

fs.writeFileSync(indexPath, html);
console.log("✅ dist/index.html patched with Pacifico + Material Icons + click fix");
