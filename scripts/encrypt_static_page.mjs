import { createCipheriv, createDecipheriv, pbkdf2Sync, randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";

function getArg(name) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? "" : process.argv[index + 1] || "";
}

const inputPath = getArg("input");
const outputPath = getArg("output");
const title = getArg("title") || "Private MINT presentation";
const password = process.env.STATIC_PAGE_PASSWORD;

if (!inputPath || !outputPath || !password) {
  console.error("Usage: STATIC_PAGE_PASSWORD=... node scripts/encrypt_static_page.mjs --input SOURCE --output DESTINATION [--title TITLE]");
  process.exit(1);
}

const plaintext = readFileSync(inputPath);
const salt = randomBytes(16);
const iv = randomBytes(12);
const iterations = 310000;
const key = pbkdf2Sync(password, salt, iterations, 32, "sha256");
const cipher = createCipheriv("aes-256-gcm", key, iv);
const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
const authenticationTag = cipher.getAuthTag();
const ciphertext = Buffer.concat([encrypted, authenticationTag]);

const decipher = createDecipheriv("aes-256-gcm", key, iv);
decipher.setAuthTag(authenticationTag);
const verified = Buffer.concat([decipher.update(encrypted), decipher.final()]);
if (!verified.equals(plaintext)) throw new Error("Encryption verification failed");

const payload = JSON.stringify({
  version: 1,
  iterations,
  salt: salt.toString("base64"),
  iv: iv.toString("base64"),
  ciphertext: ciphertext.toString("base64")
}).replaceAll("<", "\\u003c");

const escapedTitle = title
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

const output = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noimageindex">
  <title>${escapedTitle} | Private MINT presentation</title>
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root { color-scheme: dark; --bg:#090b10; --panel:#11151d; --border:#293241; --text:#e8edf4; --muted:#9aa7b7; --mint:#2dd4bf; --red:#f87171; }
    * { box-sizing:border-box; }
    html, body { min-height:100%; margin:0; background:var(--bg); color:var(--text); font-family:"JetBrains Mono", monospace; letter-spacing:0; }
    body { display:grid; grid-template-rows:auto 1fr; }
    .banner { min-height:88px; display:flex; align-items:center; padding:18px clamp(20px, 5vw, 72px); border-bottom:1px solid var(--border); background:#0d1118; }
    .banner img { display:block; width:min(440px, 76vw); height:auto; }
    main { display:grid; place-items:center; padding:32px 20px 56px; }
    .gate { width:min(460px, 100%); padding:28px; border:1px solid var(--border); border-radius:8px; background:var(--panel); box-shadow:0 18px 60px rgba(0,0,0,.3); }
    .eyebrow { margin:0 0 10px; color:var(--mint); font-size:12px; font-weight:700; text-transform:uppercase; }
    h1 { margin:0 0 24px; font-size:clamp(22px, 5vw, 30px); line-height:1.25; letter-spacing:0; }
    label { display:block; margin-bottom:8px; color:var(--muted); font-size:12px; }
    .field { display:grid; grid-template-columns:minmax(0, 1fr) auto; gap:8px; }
    input, button { min-height:44px; border-radius:6px; font:inherit; letter-spacing:0; }
    input { width:100%; min-width:0; padding:10px 12px; border:1px solid var(--border); outline:none; background:#090c12; color:var(--text); }
    input:focus { border-color:var(--mint); box-shadow:0 0 0 2px rgba(45,212,191,.15); }
    button { padding:10px 16px; border:1px solid var(--mint); background:var(--mint); color:#07100f; font-weight:700; cursor:pointer; }
    button:disabled { cursor:wait; opacity:.65; }
    .error { min-height:20px; margin:12px 0 0; color:var(--red); font-size:12px; line-height:1.5; }
    @media (max-width:520px) { .banner { min-height:72px; padding:14px 20px; } .gate { padding:22px; } .field { grid-template-columns:1fr; } }
  </style>
</head>
<body>
  <header class="banner"><a href="/" aria-label="MINT Lab home"><img src="/assets/mint-banner.png" alt="MINT LAB"></a></header>
  <main>
    <section class="gate" aria-labelledby="gate-title">
      <p class="eyebrow">Private presentation</p>
      <h1 id="gate-title">${escapedTitle}</h1>
      <form id="unlock-form">
        <label for="password">Password</label>
        <div class="field">
          <input id="password" name="password" type="password" autocomplete="current-password" required autofocus>
          <button id="unlock" type="submit">Unlock</button>
        </div>
        <p id="error" class="error" role="alert" aria-live="polite"></p>
      </form>
    </section>
  </main>
  <script>
    (function () {
      var payload = ${payload};
      var form = document.getElementById("unlock-form");
      var input = document.getElementById("password");
      var button = document.getElementById("unlock");
      var error = document.getElementById("error");

      function decodeBase64(value) {
        return Uint8Array.from(atob(value), function (character) { return character.charCodeAt(0); });
      }

      async function decrypt(password) {
        var material = await crypto.subtle.importKey(
          "raw",
          new TextEncoder().encode(password),
          "PBKDF2",
          false,
          ["deriveKey"]
        );
        var key = await crypto.subtle.deriveKey(
          { name:"PBKDF2", salt:decodeBase64(payload.salt), iterations:payload.iterations, hash:"SHA-256" },
          material,
          { name:"AES-GCM", length:256 },
          false,
          ["decrypt"]
        );
        var clear = await crypto.subtle.decrypt(
          { name:"AES-GCM", iv:decodeBase64(payload.iv), tagLength:128 },
          key,
          decodeBase64(payload.ciphertext)
        );
        return new TextDecoder().decode(clear);
      }

      form.addEventListener("submit", async function (event) {
        event.preventDefault();
        button.disabled = true;
        error.textContent = "";
        try {
          var html = await decrypt(input.value);
          document.open();
          document.write(html);
          document.close();
        } catch (unlockError) {
          error.textContent = "That password is not correct.";
          input.select();
          button.disabled = false;
        }
      });
    }());
  </script>
</body>
</html>
`;

writeFileSync(outputPath, output);
console.log(`Encrypted ${plaintext.length} bytes into ${outputPath}`);
