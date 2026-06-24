/**
 * Downloads mock product & category images from the web into the uploads/ directory.
 * Run once before starting the server:
 *   node download-images.js
 */

const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");

const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Using picsum.photos — reliable, free, no API key needed.
// Each seed produces a consistent image every time.
const images = [
  // ── Products ──────────────────────────────────────────────────────────────
  { filename: "tshirt.png",      url: "https://picsum.photos/seed/tshirt/400/400" },
  { filename: "jeans.png",       url: "https://picsum.photos/seed/jeans/400/400" },
  { filename: "headphones.png",  url: "https://picsum.photos/seed/headphones/400/400" },
  { filename: "stand.png",       url: "https://picsum.photos/seed/stand/400/400" },
  { filename: "moisturizer.png", url: "https://picsum.photos/seed/moisturizer/400/400" },
  { filename: "lipstick.png",    url: "https://picsum.photos/seed/lipstick/400/400" },
  { filename: "rice.png",        url: "https://picsum.photos/seed/rice/400/400" },
  { filename: "oliveoil.png",    url: "https://picsum.photos/seed/oliveoil/400/400" },
  // ── Categories ────────────────────────────────────────────────────────────
  { filename: "garments.png",    url: "https://picsum.photos/seed/garments/400/400" },
  { filename: "electronics.png", url: "https://picsum.photos/seed/electronics/400/400" },
  { filename: "cosmetics.png",   url: "https://picsum.photos/seed/cosmetics/400/400" },
  { filename: "grocery.png",     url: "https://picsum.photos/seed/grocery/400/400" },
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const protocol = url.startsWith("https") ? https : http;

    const request = protocol.get(url, (response) => {
      // Follow redirects (Unsplash uses them)
      if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        fs.unlink(dest, () => {});
        return download(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(dest, () => {});
        return reject(new Error(`HTTP ${response.statusCode} for ${url}`));
      }
      response.pipe(file);
      file.on("finish", () => {
        file.close();
        resolve();
      });
    });

    request.on("error", (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });

    file.on("error", (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  console.log(`\n📥 Downloading ${images.length} images into uploads/\n`);
  let success = 0;
  let failed = 0;

  for (const img of images) {
    const dest = path.join(UPLOADS_DIR, img.filename);
    if (fs.existsSync(dest)) {
      console.log(`  ✅ Already exists: ${img.filename}`);
      success++;
      continue;
    }
    try {
      process.stdout.write(`  ⬇️  Downloading ${img.filename} ...`);
      await download(img.url, dest);
      console.log(" done");
      success++;
    } catch (err) {
      console.log(` FAILED (${err.message})`);
      failed++;
    }
  }

  console.log(`\n✅ ${success} downloaded, ❌ ${failed} failed`);
  console.log(`\nNow start the server with: npm start\n`);
}

main();

// Made with Bob
