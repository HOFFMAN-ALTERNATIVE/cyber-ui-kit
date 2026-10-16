/*! cyber-ui-kit — MIT — tiny, dependency-free behaviours for the CSS components */

const prefersReducedMotion = () =>
  typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Make an element a glitch title. Optionally bursts at random intervals. Returns a stop() fn. */
export function glitch(el, { burstEvery = 4000, burstMs = 220 } = {}) {
  el.classList.add("cui-glitch");
  if (!el.dataset.text) el.dataset.text = el.textContent.trim();
  if (!burstEvery || prefersReducedMotion()) return () => {};
  let off;
  const id = setInterval(() => {
    el.classList.add("is-burst");
    off = setTimeout(() => el.classList.remove("is-burst"), burstMs);
  }, burstEvery);
  return () => { clearInterval(id); clearTimeout(off); el.classList.remove("is-burst"); };
}

/** Typewriter effect. Resolves when all lines are typed. */
export async function typewriter(el, lines, { speed = 28, lineDelay = 350, signal } = {}) {
  el.classList.add("cui-terminal");
  el.textContent = "";
  const text = document.createTextNode("");
  const caret = document.createElement("span");
  caret.className = "cui-caret";
  el.append(text, caret);
  const instant = prefersReducedMotion() || speed <= 0;
  for (const [i, line] of lines.entries()) {
    if (signal?.aborted) return;
    if (instant) text.data += line;
    else for (const ch of line) {
      if (signal?.aborted) return;
      text.data += ch;
      await sleep(speed);
    }
    if (i < lines.length - 1) { text.data += "\n"; if (!instant) await sleep(lineDelay); }
  }
}

/** Split a millisecond duration into zero-padded parts. */
export function splitDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const pad = (n) => String(n).padStart(2, "0");
  return {
    days: Math.floor(total / 86400),
    hh: pad(Math.floor((total % 86400) / 3600)),
    mm: pad(Math.floor((total % 3600) / 60)),
    ss: pad(total % 60),
    done: total === 0,
  };
}

/** Render a nixie-tube countdown (HH:MM:SS) into el. Returns stop(). */
export function nixieCountdown(el, target, { onDone, now = () => Date.now() } = {}) {
  const end = target instanceof Date ? target.getTime() : Number(target);
  el.classList.add("cui-nixie");
  el.setAttribute("role", "timer");
  const render = () => {
    const { hh, mm, ss, done } = splitDuration(end - now());
    const html = [hh, mm, ss]
      .map((g) => [...g].map((d) => `<span class="cui-nixie__digit">${d}</span>`).join(""))
      .join('<span class="cui-nixie__sep">:</span>');
    el.innerHTML = html;
    el.setAttribute("aria-label", `${hh}:${mm}:${ss} remaining`);
    if (done) { clearInterval(id); onDone?.(); }
  };
  const id = setInterval(render, 1000);
  render();
  return () => clearInterval(id);
}

/** CRT power-off animation. Resolves after the animation ends. */
export function crtOff(el) {
  return animateClass(el, "cui-crt-off", "cui-crt-on");
}
/** CRT power-on animation. */
export function crtOn(el) {
  return animateClass(el, "cui-crt-on", "cui-crt-off");
}

/** Live HUD clock (HH:MM:SS) updated every second. Returns stop(). */
export function hudClock(el, { locale, timeZone } = {}) {
  const fmt = new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false, timeZone });
  const tick = () => { el.textContent = fmt.format(new Date()); };
  tick();
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}

/** Set a .cui-meter value (0..100). */
export function setMeter(el, value) {
  const v = Math.min(100, Math.max(0, Number(value) || 0));
  el.style.setProperty("--v", String(v));
  el.setAttribute("role", "meter");
  el.setAttribute("aria-valuenow", String(v));
  el.setAttribute("aria-valuemin", "0");
  el.setAttribute("aria-valuemax", "100");
  return v;
}

/** Auto-init: [data-cui="glitch|clock|countdown|typewriter|meter"]. */
export function autoInit(root = document) {
  root.querySelectorAll("[data-cui]").forEach((el) => {
    switch (el.dataset.cui) {
      case "glitch": glitch(el); break;
      case "clock": hudClock(el); break;
      case "countdown": nixieCountdown(el, Date.now() + Number(el.dataset.seconds || 60) * 1000); break;
      case "typewriter": typewriter(el, (el.dataset.lines || el.textContent).split("|")); break;
      case "meter": setMeter(el, el.dataset.value); break;
    }
  });
}

function animateClass(el, add, remove) {
  return new Promise((resolve) => {
    el.classList.remove(remove);
    void el.offsetWidth; // restart animation
    el.classList.add(add);
    if (prefersReducedMotion() || typeof el.getAnimations !== "function") return resolve();
    el.addEventListener("animationend", () => resolve(), { once: true });
    setTimeout(resolve, 1200);
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
