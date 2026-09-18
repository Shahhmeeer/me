"use client";

/*
 * PROTOTYPE. Throwaway. Not production.
 *
 * Three variants of the Strip on the existing `/` route, switchable via
 * `?variant=`, to answer two questions from the scrub grill:
 *   Q4  - once the Strip flows, does a one-screen Spread still read as a slide?
 *   Q10 - is a hand-rolled rAF lerp smooth enough, or do we need GSAP?
 *
 *   A  snap     the Strip as shipped: native scroll, snapped to a Spread (baseline)
 *   B  scrub    tall runway, sticky Strip, scroll position scrubbed sideways; Spreads one screen
 *   C  flow     as B, but each Spread is as wide as its content and the row has gaps
 *
 * Second round, after the first look (2026-09-18): C won, and the motion was
 * janky. The yellow box carries one switch per suspect listed in
 * docs/prototypes/scrub-strip.md, plus a frame meter, so each suspect can be
 * ruled in or out by flipping it and reading the number.
 *
 * Third round, after the second look: smooth, with no Blobs drawn, and the
 * Blobs are dropped. The box also carries the counters going (one heading
 * per Panel), Shahmeer's light palette, and two ideas for the empty space
 * above and below the content: a pattern on the ground moving at a slower
 * rate, and a stagger that lifts every other Spread.
 *
 * Fourth round, after the third look ("really, really good"): built on
 * those. Four unDraw illustrations, retinted to the palette, placed in the
 * gaps between Spreads, each revealed as it arrives, floating gently, and
 * moving at a slower rate than the content; five more grounds; and the
 * type a step up on the Strip, for the "bigger fonts" option.
 *
 * Fifth round, after the fourth look: the illustrations go behind the
 * content (the cards and text are the UI layer, the drawings the world
 * behind it), Contact is placed by its content box, and eight more pieces
 * are retinted and scattered so most Spreads have one nearby.
 */

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";

import { Bar, type PanelSpreads } from "@/components/bar";
import { Strip } from "@/components/strip";
import type { BarCopy } from "@/content/site";

const VARIANTS = ["A", "B", "C"] as const;
type Variant = (typeof VARIANTS)[number];
const NAMES: Record<Variant, string> = { A: "snap (as shipped)", B: "scrub, one-screen Spreads", C: "scrub, Spreads sized to content" };

/*
 * The knobs. Defaults are what Shahmeer called "really, really good" at
 * the third look, plus the illustrations, which were the ask that followed.
 */
type Pattern = "none" | "dots" | "grid" | "plus" | "hatch" | "blueprint" | "grain" | "waves";
const PATTERNS: { value: Pattern; name: string }[] = [
  { value: "none", name: "plain" },
  { value: "dots", name: "dot grid" },
  { value: "grid", name: "line grid" },
  { value: "plus", name: "plus grid" },
  { value: "blueprint", name: "blueprint (major + minor)" },
  { value: "hatch", name: "diagonal hatch" },
  { value: "waves", name: "contour waves" },
  { value: "grain", name: "paper grain (rate 0)" },
];
type Knobs = {
  /** Seconds for the Glide to settle. 0 is 1:1: no Glide, only Chrome's own wheel smoothing. Suspect 4. */
  glide: number;
  /** The pill's backdrop blur on the Nav and the Bar. Suspect 2. */
  backdrop: boolean;
  /** `contain: paint` on each Panel, so an off-screen one paints nothing. Suspect 1. */
  contain: boolean;
  /** One composited layer per Panel, moved individually, instead of one row ten screens wide. Suspect 1. */
  perPanelLayers: boolean;
  /** No ` · 02 / 04`, and the Panel's label and line said once, on its first Spread. */
  noCounters: boolean;
  /** Shahmeer's light palette (Pearl Beige, Charcoal, Powder Blush, Celadon, Pale Sky) over the tokens. */
  light: boolean;
  /** Every other Spread lifted 5vh and the rest dropped, so the row has a skyline. */
  stagger: boolean;
  /** A pattern on the ground, under everything, fixed to the viewport and moved at `patternRate`. */
  pattern: Pattern;
  /** The pattern moves at this share of the content's speed: 0 is fixed to the screen, 1 is fixed to the Strip. */
  patternRate: number;
  /** A soft darkening at the edges of the screen, over any ground. */
  vignette: boolean;
  /** The illustrations in the gaps between Spreads. */
  art: boolean;
  /** The illustrations move at this share of the content's speed: under 1 and they lag the cards, which reads as depth. */
  artRate: number;
  /** The illustrations bob gently, a few pixels over several seconds. */
  artFloat: boolean;
  /** The type scale one step up on the Strip. */
  typeUp: boolean;
};
const DEFAULTS: Knobs = {
  glide: 0.7,
  backdrop: true,
  contain: false,
  perPanelLayers: false,
  noCounters: true,
  light: true,
  stagger: true,
  pattern: "dots",
  patternRate: 0.5,
  vignette: false,
  art: true,
  artRate: 0.85,
  artFloat: true,
  typeUp: false,
};

/*
 * The illustrations: which Spread each sits beside, which edge of it, how
 * far along and down, how wide. `edge: "after"` is the gap after the
 * Spread's right edge; `"before"` is measured from its left edge inward,
 * for the last Spread, which has no gap after it; `"box"` is measured from
 * the left edge of the Spread's *content* box, for a Spread whose content
 * is centred in a wider frame (Contact: `max-w-6xl` in a 100vw Spread),
 * where the Spread's own edge is nowhere near its words. All in vw so a
 * wider screen gets the same picture, not more beige.
 *
 * Fifth round: they sit behind the content, not over it. The cards and
 * text are the UI layer and the illustrations are the world behind it, so
 * one that runs under a card is depth, not collision, and the lag reads as
 * parallax against the cards in front. One near most Spreads: the Hero has
 * its portrait and gets none.
 */
type Art = {
  panel: string;
  spread: number;
  edge: "after" | "before" | "box";
  src: string;
  alt: string;
  top: string;
  offsetVw: number;
  widthVw: number;
};
const ART: Art[] = [
  // The laptop between the portrait and the certifications: the developer's desk beside the developer.
  { panel: "home", spread: 0, edge: "after", src: "/images/proto/bug-detected_71if.svg", alt: "", top: "40%", offsetVw: -2, widthVw: 12 },
  { panel: "home", spread: 1, edge: "after", src: "/images/proto/thumbs-up_f300.svg", alt: "", top: "30%", offsetVw: -2, widthVw: 9 },
  { panel: "work", spread: 0, edge: "after", src: "/images/proto/random-idea_a29k.svg", alt: "", top: "46%", offsetVw: -1, widthVw: 10 },
  { panel: "work", spread: 1, edge: "after", src: "/images/proto/soda-splash_1ti2.svg", alt: "", top: "18%", offsetVw: 0, widthVw: 7 },
  { panel: "work", spread: 2, edge: "after", src: "/images/proto/the-right-time_n3ys.svg", alt: "", top: "40%", offsetVw: -3, widthVw: 18 },
  { panel: "work", spread: 3, edge: "after", src: "/images/proto/plants_md5c.svg", alt: "", top: "44%", offsetVw: -4, widthVw: 16 },
  { panel: "skills", spread: 0, edge: "after", src: "/images/proto/generating-response_y0h5.svg", alt: "", top: "6%", offsetVw: -3, widthVw: 22 },
  { panel: "experience", spread: 0, edge: "after", src: "/images/proto/code-deployed_iwvu.svg", alt: "", top: "12%", offsetVw: -3, widthVw: 16 },
  { panel: "experience", spread: 1, edge: "after", src: "/images/proto/message-sent_iyz6.svg", alt: "", top: "14%", offsetVw: -2, widthVw: 12 },
  // Nothing after the last Role: at Contact the address starts near the frame's edge, and anything in that gap runs behind it.
  // Contact: the envelope in the left margin, and the figure under the links, in the bare band below the centred content.
  { panel: "contact", spread: 0, edge: "box", src: "/images/proto/mail-sent_dagx.svg", alt: "", top: "10%", offsetVw: -14, widthVw: 16 },
  { panel: "contact", spread: 0, edge: "box", src: "/images/proto/working-at-home_usrj.svg", alt: "", top: "78%", offsetVw: 0, widthVw: 12 },
];

/** What the frame meter reports once a second: frames over ~22ms, and the longest. */
type Meter = { long: number; worst: number };

type Props = { spreads: PanelSpreads[]; barCopy: BarCopy; children: ReactNode };

export function PrototypeStrip(props: Props) {
  return (
    <Suspense fallback={<Strip {...props} />}>
      <Switch {...props} />
    </Suspense>
  );
}

function Switch(props: Props) {
  const params = useSearchParams();
  const raw = params.get("variant")?.toUpperCase();
  const variant: Variant = (VARIANTS as readonly string[]).includes(raw ?? "") ? (raw as Variant) : "A";
  const [knobs, setKnobs] = useState<Knobs>(DEFAULTS);
  const [meter, setMeter] = useState<Meter>({ long: 0, worst: 0 });
  const set = <K extends keyof Knobs>(key: K, value: Knobs[K]) => setKnobs((prev) => ({ ...prev, [key]: value }));

  const go = (v: Variant) => {
    const url = new URL(window.location.href);
    url.searchParams.set("variant", v);
    url.hash = "";
    window.location.href = url.toString();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      if (!e.shiftKey) return;
      const i = VARIANTS.indexOf(variant);
      if (e.key === "ArrowRight") go(VARIANTS[(i + 1) % VARIANTS.length]);
      if (e.key === "ArrowLeft") go(VARIANTS[(i + VARIANTS.length - 1) % VARIANTS.length]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [variant]);

  // The switches that are CSS live as classes on <html>; `app/globals.css` reads them.
  useEffect(() => {
    if (variant === "A") return;
    const c = document.documentElement.classList;
    const all = ["proto-no-backdrop", "proto-contain", "proto-panel-layers", "proto-no-counters", "proto-light", "proto-stagger", "proto-vignette", "proto-art-off", "proto-art-float", "proto-type-up", ...PATTERNS.map((p) => `proto-pattern-${p.value}`)];
    c.remove(...all);
    c.toggle("proto-no-backdrop", !knobs.backdrop);
    c.toggle("proto-contain", knobs.contain);
    c.toggle("proto-panel-layers", knobs.perPanelLayers);
    c.toggle("proto-no-counters", knobs.noCounters);
    c.toggle("proto-light", knobs.light);
    c.toggle("proto-stagger", knobs.stagger);
    c.toggle("proto-vignette", knobs.vignette);
    c.toggle("proto-art-off", !knobs.art);
    c.toggle("proto-art-float", knobs.artFloat);
    c.toggle("proto-type-up", knobs.typeUp);
    c.add(`proto-pattern-${knobs.pattern}`);
    return () => c.remove(...all);
  }, [variant, knobs]);

  const i = VARIANTS.indexOf(variant);
  return (
    <>
      {variant === "A" ? (
        <Strip {...props} />
      ) : (
        <ScrubStrip {...props} flow={variant === "C"} knobs={knobs} onMeter={setMeter} />
      )}

      {process.env.NODE_ENV !== "production" && (
        <div
          style={{ position: "fixed", left: 12, bottom: 12, zIndex: 50, background: "#ff0", color: "#000", fontFamily: "monospace", fontSize: 12, padding: "8px 10px", borderRadius: 8, boxShadow: "0 4px 16px rgba(0,0,0,.5)", display: "grid", gap: 6 }}
        >
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={() => go(VARIANTS[(i + VARIANTS.length - 1) % VARIANTS.length])}>←</button>
            <strong>{variant}</strong> {NAMES[variant]}
            <button onClick={() => go(VARIANTS[(i + 1) % VARIANTS.length])}>→</button>
            <span style={{ opacity: 0.6 }}>(shift+←/→)</span>
          </div>
          {variant !== "A" && (
            <>
              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                glide {knobs.glide === 0 ? "off (1:1)" : `${knobs.glide.toFixed(2)}s`}
                <input type="range" min={0} max={1.2} step={0.05} value={knobs.glide} onChange={(e) => set("glide", Number(e.target.value))} />
              </label>
              <Check label="one heading per Panel (no counters)" value={knobs.noCounters} onChange={(v) => set("noCounters", v)} />
              <Check label="light palette (beige / charcoal / blush)" value={knobs.light} onChange={(v) => set("light", v)} />
              <Check label="stagger Spreads up and down" value={knobs.stagger} onChange={(v) => set("stagger", v)} />
              <Check label="type a step up on the Strip" value={knobs.typeUp} onChange={(v) => set("typeUp", v)} />
              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                ground
                <select value={knobs.pattern} onChange={(e) => set("pattern", e.target.value as Pattern)}>
                  {PATTERNS.map((p) => (
                    <option key={p.value} value={p.value}>{p.name}</option>
                  ))}
                </select>
                rate {knobs.patternRate.toFixed(2)}
                <input type="range" min={0} max={1} step={0.05} value={knobs.patternRate} onChange={(e) => set("patternRate", Number(e.target.value))} />
              </label>
              <Check label="vignette (soft dark edges)" value={knobs.vignette} onChange={(v) => set("vignette", v)} />
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <Check label="illustrations" value={knobs.art} onChange={(v) => set("art", v)} />
                <Check label="float" value={knobs.artFloat} onChange={(v) => set("artFloat", v)} />
                <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  rate {knobs.artRate.toFixed(2)}
                  <input type="range" min={0.5} max={1} step={0.05} value={knobs.artRate} onChange={(e) => set("artRate", Number(e.target.value))} />
                </label>
              </div>
              <details>
                <summary style={{ cursor: "pointer", opacity: 0.7 }}>jank suspects (cleared at the second look)</summary>
                <Check label="pill backdrop blur (suspect 2)" value={knobs.backdrop} onChange={(v) => set("backdrop", v)} />
                <Check label="contain: paint per Panel (suspect 1)" value={knobs.contain} onChange={(v) => set("contain", v)} />
                <Check label="one layer per Panel, not one row (suspect 1)" value={knobs.perPanelLayers} onChange={(v) => set("perPanelLayers", v)} />
              </details>
              <div style={{ borderTop: "1px solid rgba(0,0,0,.2)", paddingTop: 4 }}>
                long frames <strong>{meter.long}</strong>/s · worst <strong>{meter.worst}</strong>ms
                <span style={{ opacity: 0.6 }}> (long = over 22ms)</span>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

function Check({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

/* ---------------------------------------------------------------------- */

type ScrubProps = Props & { flow: boolean; knobs: Knobs; onMeter: (m: Meter) => void };

function ScrubStrip({ spreads, barCopy, children, flow, knobs, onMeter }: ScrubProps) {
  const runway = useRef<HTMLDivElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLDivElement>(null);
  const artEls = useRef<(HTMLImageElement | null)[]>([]);
  const live = useRef({ knobs, onMeter });
  const relayout = useRef<() => void>(() => {});
  const [fieldWidth, setFieldWidth] = useState(0);
  const [current, setCurrent] = useState(0);
  const [hintSpent, setHintSpent] = useState(false);

  // A knob change reaches the loop through the ref; switching how the row is layered clears the old transforms.
  useEffect(() => {
    const before = live.current.knobs;
    live.current = { knobs, onMeter };
    const track = row.current;
    if (track && before.perPanelLayers !== knobs.perPanelLayers) {
      track.style.transform = "";
      for (const p of track.querySelectorAll<HTMLElement>("section[id]")) p.style.transform = "";
    }
    if (before.patternRate !== knobs.patternRate || before.stagger !== knobs.stagger) relayout.current();
  }, [knobs, onMeter]);

  useEffect(() => {
    const track = row.current;
    const road = runway.current;
    if (!track || !road) return;

    const isLarge = () => window.matchMedia("(min-width: 1280px) and (orientation: landscape) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const spreadsOf = () => Array.from(track.querySelectorAll<HTMLElement>(".spread"));
    const panelsOf = () => Array.from(track.querySelectorAll<HTMLElement>("section[id]"));
    const maxX = () => Math.max(0, track.scrollWidth - window.innerWidth);
    // 1px of runway = 1px sideways, so the runway is the Strip's overhang plus one screen.
    let panelLefts: { el: HTMLElement; left: number }[] = [];
    // Each illustration: its element, and the x at which it sits where it was placed (its place, centred on screen).
    let artAnchors: { el: HTMLImageElement; anchor: number }[] = [];
    const layout = () => {
      if (!isLarge()) { road.style.height = ""; track.style.transform = ""; return; }
      road.style.height = `${maxX() + window.innerHeight}px`;
      const origin = track.getBoundingClientRect().left;
      panelLefts = panelsOf().map((el) => ({ el, left: el.getBoundingClientRect().left - origin }));
      // The ground pattern: the overhang at the pattern's rate, plus one screen, so there is always ground under the viewport.
      setFieldWidth(maxX() * live.current.knobs.patternRate + window.innerWidth);
      // The illustrations: placed by the Spread they sit beside, measured now that the Spreads have their widths.
      artAnchors = [];
      ART.forEach((art, i) => {
        const el = artEls.current[i];
        if (!el) return;
        const spread = spreadsOf().filter((s) => s.closest("section[id]")?.id === art.panel)[art.spread];
        if (!spread) { el.style.display = "none"; return; }
        // "box" measures the content box inside the Spread, not the Spread's frame.
        const r = (art.edge === "box" ? spread.firstElementChild ?? spread : spread).getBoundingClientRect();
        const vw = window.innerWidth / 100;
        const left = (art.edge === "after" ? r.right : r.left) - origin + art.offsetVw * vw;
        el.style.display = "";
        el.style.left = `${left}px`;
        el.style.top = art.top;
        el.style.width = `${art.widthVw}vw`;
        artAnchors.push({ el, anchor: left + (art.widthVw * vw) / 2 - window.innerWidth / 2 });
      });
    };
    relayout.current = layout;

    let x = window.scrollY;
    let last = performance.now();
    let frame = 0;
    // The frame meter: frames longer than 22ms (one dropped at 60Hz) per second, and the longest.
    let long = 0;
    let worst = 0;
    let since = last;
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (dt > 0.022) long++;
      if (dt > worst) worst = dt;
      if (now - since >= 1000) {
        live.current.onMeter({ long, worst: Math.round(worst * 1000) });
        long = 0; worst = 0; since = now;
      }
      if (isLarge()) {
        const k = live.current.knobs;
        const target = Math.min(window.scrollY, maxX());
        // glide = time to settle ~95%: tau = glide / 3. At 0 the Strip is 1:1 with the runway.
        const tau = k.glide / 3;
        x = reduced.matches || tau === 0 ? target : x + (target - x) * (1 - Math.exp(-dt / tau));
        if (Math.abs(target - x) < 0.05) x = target;
        const shift = `translate3d(${-x}px,0,0)`;
        if (k.perPanelLayers) {
          for (const { el } of panelLefts) el.style.transform = shift;
        } else {
          track.style.transform = shift;
        }
        // The ground pattern moves at its own rate, a fraction of the content's.
        if (field.current) field.current.style.transform = `translate3d(${-x * k.patternRate}px,0,0)`;
        // An illustration lags the cards: at its anchor it is where it was placed, and around it, it moves at artRate.
        for (const { el, anchor } of artAnchors) el.style.transform = `translate3d(${(x - anchor) * (1 - k.artRate)}px,0,0)`;
      }
      frame = requestAnimationFrame(tick);
    };

    layout();
    frame = requestAnimationFrame(tick);
    const ro = new ResizeObserver(layout);
    ro.observe(track);
    window.addEventListener("resize", layout);

    // Land on an element by scrolling the runway to its left edge.
    const landOn = (el: Element | null, behavior: ScrollBehavior) => {
      if (!(el instanceof HTMLElement) || !isLarge()) return false;
      const left = el.getBoundingClientRect().left - track.getBoundingClientRect().left;
      window.scrollTo({ top: Math.min(left, maxX()), behavior });
      return true;
    };
    // Opening at a hash, and Nav links: the browser would scroll the sticky Strip vertically, which does nothing.
    if (window.location.hash) {
      const el = document.getElementById(window.location.hash.slice(1));
      if (el && track.contains(el)) { landOn(el, "instant"); x = window.scrollY; }
    }
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;
      const el = document.getElementById(a.getAttribute("href")!.slice(1));
      if (el && track.contains(el) && landOn(el, "smooth")) e.preventDefault();
    };
    document.addEventListener("click", onClick);

    // A sideways trackpad swipe moves the runway; ArrowLeft/Right move one screen (Q18 open).
    const onWheel = (e: WheelEvent) => {
      if (!isLarge() || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      window.scrollBy({ top: e.deltaX });
    };
    const onKey = (e: KeyboardEvent) => {
      if (!isLarge() || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        window.scrollBy({ top: (e.key === "ArrowRight" ? 1 : -1) * window.innerWidth, behavior: "smooth" });
      }
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKey);

    // Which Spread is nearest the middle: lights the Nav, the Bar's dot, writes the hash.
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('nav ul a[href^="#"]'));
    let opened: number | null = null;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const all = spreadsOf();
          const index = all.indexOf(entry.target as HTMLElement);
          const panel = entry.target.closest<HTMLElement>("section[id]");
          if (!panel) continue;
          for (const l of links) {
            if (l.getAttribute("href") === `#${panel.id}`) l.setAttribute("aria-current", "page");
            else l.removeAttribute("aria-current");
          }
          setCurrent(index);
          if (opened === null) opened = index;
          else if (index !== opened) setHintSpent(true);
          const isHome = panel === all[0]?.closest("section[id]");
          const hash = isHome ? "" : `#${panel.id}`;
          if (window.location.hash !== hash) {
            history.replaceState(null, "", window.location.pathname + window.location.search + hash);
          }
        }
      },
      { rootMargin: "0px -45% 0px -45%" },
    );
    for (const s of spreadsOf()) io.observe(s);

    // An illustration arrives: once it is on screen it fades and rises in, and stays.
    const arrive = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) entry.target.classList.add("proto-art-in");
      },
      { rootMargin: "0px -10% 0px -10%" },
    );
    for (const el of artEls.current) if (el) arrive.observe(el);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      arrive.disconnect();
      window.removeEventListener("resize", layout);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
      road.style.height = "";
      track.style.transform = "";
      for (const p of panelsOf()) p.style.transform = "";
    };
  }, []);

  const select = (index: number) => {
    const s = row.current?.querySelectorAll<HTMLElement>(".spread")[index];
    if (s && row.current) window.scrollTo({ top: s.getBoundingClientRect().left - row.current.getBoundingClientRect().left, behavior: "smooth" });
  };
  const step = (direction: 1 | -1) => {
    window.scrollBy({ top: direction * window.innerWidth, behavior: "smooth" });
  };

  return (
    <>
      {knobs.pattern !== "none" && (
        <div aria-hidden="true" className="proto-field">
          <div ref={field} style={{ width: fieldWidth }} />
        </div>
      )}
      {knobs.vignette && <div aria-hidden="true" className="proto-vignette-layer" />}

      <div ref={runway} className="proto-runway">
        <main
          tabIndex={0}
          className={`strip proto-scrub${flow ? " proto-flow" : ""} flex flex-1 flex-col focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent`}
        >
          <div ref={row} className="proto-row">
            {/* The illustrations are decoration; the alt is empty so a screen reader passes them by. They come before the Panels so they paint under them. */}
            {ART.map((art, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={art.src}
                  ref={(el) => { artEls.current[i] = el; }}
                  src={art.src}
                  alt={art.alt}
                  className="proto-art"
                  style={{ animationDelay: `${-i * 1.7}s` }}
                  draggable={false}
                />
              ))}
            {children}
          </div>
        </main>
      </div>

      <Bar spreads={spreads} copy={barCopy} current={current} hintSpent={hintSpent} onSelect={select} onStep={step} />
    </>
  );
}
