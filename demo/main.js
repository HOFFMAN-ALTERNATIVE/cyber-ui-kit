// Fonts are bundled, not loaded from Google: no third-party request, no
// visitor IP sent to a font CDN.
import "@fontsource/share-tech-mono/400.css";
import "@fontsource/orbitron/700.css";
import "@fontsource/orbitron/900.css";
import { autoInit, typewriter, nixieCountdown, setMeter, crtOff, crtOn } from "../src/cyber-ui.js";

autoInit();

typewriter(document.getElementById("term"), [
  "> boot sequence initiated",
  "> loading modules ......... ok",
  "> handshake with node-07 .. ok",
  "> welcome, operator.",
]);

const nixie = document.getElementById("nixie");
const startCountdown = () => nixieCountdown(nixie, Date.now() + 90_000, { onDone: startCountdown });
startCountdown();

const meters = ["m-cpu", "m-mem", "m-net"].map((id) => document.getElementById(id));
const jitter = () => meters.forEach((m) => setMeter(m, 20 + Math.random() * 75));
jitter();
setInterval(jitter, 1800);

document.getElementById("power").addEventListener("click", async () => {
  const screen = document.getElementById("screen");
  await crtOff(screen);
  setTimeout(() => crtOn(screen), 900);
});
