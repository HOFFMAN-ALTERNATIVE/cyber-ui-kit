import { defineConfig } from "vite";

// Build-only CSP for the demo (the dev server injects inline styles for HMR).
// GitHub Pages cannot send headers, so it ships as a <meta> tag.
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join("; ");

const csp = () => ({
  name: "csp-meta",
  apply: "build",
  transformIndexHtml: () => [
    { tag: "meta", attrs: { "http-equiv": "Content-Security-Policy", content: CSP }, injectTo: "head-prepend" },
    { tag: "meta", attrs: { name: "referrer", content: "no-referrer" }, injectTo: "head" },
  ],
});

export default defineConfig({
  root: "demo",
  base: "./",
  plugins: [csp()],
  build: { outDir: "../dist", emptyOutDir: true },
});
