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
 * The bar at the bottom-left has the two knobs: glide length and Blob rate.
 */

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";

import { Bar, type PanelSpreads } from "@/components/bar";
import { Strip } from "@/components/strip";
import type { BarCopy } from "@/content/site";

const VARIANTS = ["A", "B", "C"] as const;
type Variant = (typeof VARIANTS)[number];
const NAMES: Record<Variant, string> = { A: "snap (as shipped)", B: "scrub, one-screen Spreads", C: "scrub, Spreads sized to content" };

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
  const [glide, setGlide] = useState(0.7);
  const [blobRate, setBlobRate] = useState(0.5);

  const go = (v: Variant) => {
    const url = new URL(window.location.href);
    url.searchParams.set("variant", v);
    url.hash = "";
    window.location.href = url.toString();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (!e.shiftKey) return;
      const i = VARIANTS.indexOf(variant);
      if (e.key === "ArrowRight") go(VARIANTS[(i + 1) % VARIANTS.length]);
      if (e.key === "ArrowLeft") go(VARIANTS[(i + VARIANTS.length - 1) % VARIANTS.length]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [variant]);

  const i = VARIANTS.indexOf(variant);
  return (
    <>
      {variant === "A" ? (
        <Strip {...props} />
      ) : (
        <ScrubStrip {...props} flow={variant === "C"} glide={glide} blobRate={blobRate} />
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
                glide {glide.toFixed(2)}s
                <input type="range" min={0.3} max={1.2} step={0.05} value={glide} onChange={(e) => setGlide(Number(e.target.value))} />
              </label>
              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                blob rate {blobRate.toFixed(2)}
                <input type="range" min={0} max={1} step={0.05} value={blobRate} onChange={(e) => setBlobRate(Number(e.target.value))} />
              </label>
            </>
          )}
        </div>
      )}
    </>
  );
}

/* ---------------------------------------------------------------------- */

type ScrubProps = Props & { flow: boolean; glide: number; blobRate: number };

function ScrubStrip({ spreads, barCopy, children, flow, glide, blobRate }: ScrubProps) {
  const runway = useRef<HTMLDivElement>(null);
  const row = useRef<HTMLDivElement>(null);
  const knobs = useRef({ glide, blobRate });
  useEffect(() => {
    knobs.current = { glide, blobRate };
  }, [glide, blobRate]);
  const [current, setCurrent] = useState(0);
  const [hintSpent, setHintSpent] = useState(false);

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
    const layout = () => {
      if (!isLarge()) { road.style.height = ""; track.style.transform = ""; return; }
      road.style.height = `${maxX() + window.innerHeight}px`;
      const origin = track.getBoundingClientRect().left;
      panelLefts = panelsOf().map((el) => ({ el, left: el.getBoundingClientRect().left - origin }));
    };

    let x = window.scrollY;
    let last = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (isLarge()) {
        const target = Math.min(window.scrollY, maxX());
        // glide = time to settle ~95%: tau = glide / 3
        const tau = knobs.current.glide / 3;
        x = reduced.matches ? target : x + (target - x) * (1 - Math.exp(-dt / tau));
        if (Math.abs(target - x) < 0.05) x = target;
        track.style.transform = `translate3d(${-x}px,0,0)`;
        // Blobs: each Panel's field moves at blobRate of the content while the Panel crosses.
        const rate = knobs.current.blobRate;
        for (const { el, left } of panelLefts) {
          el.style.setProperty("--proto-blob-shift", `${(x - left) * (1 - rate)}px`);
        }
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

    // A sideways trackpad swipe moves the runway; ArrowLeft/Right move one Spread.
    const onWheel = (e: WheelEvent) => {
      if (!isLarge() || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      window.scrollBy({ top: e.deltaX });
    };
    const onKey = (e: KeyboardEvent) => {
      if (!isLarge() || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
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

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("resize", layout);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
      road.style.height = "";
      track.style.transform = "";
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
      <div ref={runway} className="proto-runway">
        <main
          tabIndex={0}
          className={`strip proto-scrub${flow ? " proto-flow" : ""} flex flex-1 flex-col focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent`}
        >
          <div ref={row} className="proto-row">{children}</div>
        </main>
      </div>

      <Bar spreads={spreads} copy={barCopy} current={current} hintSpent={hintSpent} onSelect={select} onStep={step} />
    </>
  );
}
