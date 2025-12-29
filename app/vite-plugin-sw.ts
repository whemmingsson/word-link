import type { Plugin } from "vite";
import * as fs from "fs";
import * as path from "path";

export function serviceWorkerPlugin(): Plugin {
  return {
    name: "vite-plugin-service-worker",
    apply: "build",
    closeBundle() {
      const distDir = path.resolve(__dirname, "dist");
      const swPath = path.join(distDir, "sw.js");
      const assetsDir = path.join(distDir, "assets");

      // Read the service worker file
      if (!fs.existsSync(swPath)) {
        console.warn("Service worker file not found at:", swPath);
        return;
      }

      // Get all files in the assets directory
      const assetFiles: string[] = [];
      if (fs.existsSync(assetsDir)) {
        const files = fs.readdirSync(assetsDir);
        files.forEach((file) => {
          assetFiles.push(`./assets/${file}`);
        });
      }

      // Read the service worker content
      let swContent = fs.readFileSync(swPath, "utf-8");

      // Create the list of files to cache
      const filesToCache = [
        "./index.html",
        "./manifest.json",
        "./favicon.png",
        ...assetFiles,
      ];

      // Replace the urlsToCache array in the service worker
      swContent = swContent.replace(
        /const urlsToCache = \[[\s\S]*?\];/,
        `const urlsToCache = ${JSON.stringify(filesToCache, null, 2)};`
      );

      // Write the updated service worker
      fs.writeFileSync(swPath, swContent);
      console.log("✓ Service worker updated with asset manifest");
      console.log(`  Cached ${filesToCache.length} files`);
    },
  };
}
