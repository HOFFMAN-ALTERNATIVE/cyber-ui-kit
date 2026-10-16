import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { glitch, typewriter, splitDuration, nixieCountdown, setMeter, autoInit, crtOff } from "../src/cyber-ui.js";

beforeEach(() => { document.body.innerHTML = ""; });
afterEach(() => { vi.useRealTimers(); });

describe("splitDuration", () => {
  it("pads and splits", () => {
    expect(splitDuration(3_723_000)).toMatchObject({ hh: "01", mm: "02", ss: "03", done: false });
  });
  it("clamps negatives to zero", () => {
    expect(splitDuration(-5)).toMatchObject({ hh: "00", mm: "00", ss: "00", done: true });
  });
  it("counts days", () => { expect(splitDuration(90_000_000).days).toBe(1); });
});

describe("glitch", () => {
  it("adds class and data-text, stop() clears timers", () => {
    vi.useFakeTimers();
    const el = Object.assign(document.createElement("h1"), { textContent: " HELLO " });
    const stop = glitch(el, { burstEvery: 100, burstMs: 50 });
    expect(el.classList.contains("cui-glitch")).toBe(true);
    expect(el.dataset.text).toBe("HELLO");
    vi.advanceTimersByTime(100);
    expect(el.classList.contains("is-burst")).toBe(true);
    stop();
    expect(el.classList.contains("is-burst")).toBe(false);
  });
});

describe("typewriter", () => {
  it("types all lines with a caret", async () => {
    const el = document.createElement("div");
    await typewriter(el, ["ab", "cd"], { speed: 0 });
    expect(el.textContent).toBe("ab\ncd");
    expect(el.querySelector(".cui-caret")).not.toBeNull();
  });
  it("stops when aborted", async () => {
    const el = document.createElement("div");
    const ac = new AbortController(); ac.abort();
    await typewriter(el, ["xyz"], { speed: 1, signal: ac.signal });
    expect(el.textContent).toBe("");
  });
});

describe("nixieCountdown", () => {
  it("renders 6 digits and fires onDone", () => {
    vi.useFakeTimers();
    let t = 0;
    const onDone = vi.fn();
    const el = document.createElement("div");
    nixieCountdown(el, 2000, { now: () => t, onDone });
    expect(el.querySelectorAll(".cui-nixie__digit")).toHaveLength(6);
    expect(el.getAttribute("aria-label")).toBe("00:00:02 remaining");
    t = 2000; vi.advanceTimersByTime(1000);
    expect(onDone).toHaveBeenCalledOnce();
  });
});

describe("setMeter", () => {
  it("clamps and sets aria", () => {
    const el = document.createElement("span");
    expect(setMeter(el, 150)).toBe(100);
    expect(setMeter(el, "x")).toBe(0);
    expect(el.getAttribute("role")).toBe("meter");
  });
});

describe("crtOff", () => {
  it("resolves and applies class", async () => {
    const el = document.createElement("div");
    await crtOff(el);
    expect(el.classList.contains("cui-crt-off")).toBe(true);
  });
});

describe("autoInit", () => {
  it("wires data-cui elements", () => {
    document.body.innerHTML = '<h1 data-cui="glitch">X</h1><span class="cui-meter" data-cui="meter" data-value="42"></span>';
    autoInit();
    expect(document.querySelector("h1").classList.contains("cui-glitch")).toBe(true);
    expect(document.querySelector(".cui-meter").style.getPropertyValue("--v")).toBe("42");
  });
});
