import tailwindcss from "@tailwindcss/postcss";
import react from "@vitejs/plugin-react";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";

const exportRoot = fileURLToPath(new URL(".", import.meta.url));
const projectRoot = path.resolve(exportRoot, "..");
const outputRoot = path.resolve(projectRoot, "../outputs");
const buildRoot = path.join(outputRoot, "movendo-trainer-html");
const standaloneFile = path.join(outputRoot, "FutureBody-Trainer-etap-5.html");

function embedLogo(): Plugin {
  const assets = ["futurebody-logo.png", "futurebody-mark-transparent-v1.png"].map((fileName) => ({
    publicPath: `/${fileName}`,
    dataUri: `data:image/png;base64,${readFileSync(path.join(projectRoot, "public", fileName)).toString("base64")}`,
  }));

  return {
    name: "embed-futurebody-logo",
    enforce: "pre",
    transform(code, id) {
      if (!id.endsWith("components/movendo-app.tsx")) return null;
      return assets.reduce((output, asset) => output.replaceAll(JSON.stringify(asset.publicPath), JSON.stringify(asset.dataUri)), code);
    },
  };
}

function embedExerciseVisuals(): Plugin {
  const assets = ["romanian-deadlift-realistic-female-v01.png", "anatomy-female-front-back-v01.png"].map((fileName) => ({
    publicPath: `/exercise-visuals/${fileName}`,
    dataUri: `data:image/png;base64,${readFileSync(path.join(projectRoot, "public", "exercise-visuals", fileName)).toString("base64")}`,
  }));

  return {
    name: "embed-exercise-visuals",
    enforce: "pre",
    transform(code, id) {
      if (!id.endsWith("lib/exercise-library.ts")) return null;
      return assets.reduce((output, asset) => output.replaceAll(JSON.stringify(asset.publicPath), JSON.stringify(asset.dataUri)), code);
    },
  };
}

function createStandaloneHtml(): Plugin {
  return {
    name: "create-standalone-html",
    closeBundle() {
      const htmlPath = path.join(buildRoot, "index.html");
      let html = readFileSync(htmlPath, "utf8");

      html = html.replace(
        /<link rel="stylesheet" crossorigin href="\.\/(assets\/[^"]+\.css)">/g,
        (_match, assetPath: string) => {
          const css = readFileSync(path.join(buildRoot, assetPath), "utf8");
          return `<style>${css}</style>`;
        },
      );

      html = html.replace(
        /<script type="module" crossorigin src="\.\/(assets\/[^"]+\.js)"><\/script>/g,
        (_match, assetPath: string) => {
          const javascript = readFileSync(path.join(buildRoot, assetPath), "utf8");
          return `<script type="module">${javascript}</script>`;
        },
      );

      writeFileSync(standaloneFile, html, "utf8");
    },
  };
}

export default defineConfig({
  root: exportRoot,
  base: "./",
  css: { postcss: { plugins: [tailwindcss()] } },
  resolve: { alias: { "@": projectRoot } },
  plugins: [embedLogo(), embedExerciseVisuals(), react(), createStandaloneHtml()],
  build: {
    outDir: buildRoot,
    emptyOutDir: true,
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
});
