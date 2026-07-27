"use client";

import type { Photo, PhotoSettings } from "@lib/photos";
import {
  Aperture,
  Camera,
  Gauge,
  ImageOff,
  Loader2,
  Timer,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const SETTING_ICONS = {
  body: Camera,
  lens: Aperture,
  iso: Gauge,
  shutter: Timer,
  aperture: Aperture,
} as const;

// Render order for the hover/lightbox chips.
const SETTING_KEYS = ["body", "lens", "iso", "shutter", "aperture"] as const;

function presentSettings(
  settings: PhotoSettings,
): Array<{ key: keyof PhotoSettings; value: string }> {
  return SETTING_KEYS.flatMap((key) => {
    const value = settings[key];
    return value ? [{ key, value }] : [];
  });
}

function SettingChips({
  settings,
  size = "sm",
}: {
  settings: PhotoSettings;
  size?: "sm" | "md";
}) {
  const chips = presentSettings(settings);
  if (chips.length === 0) return null;

  return (
    <ul
      className={`flex flex-wrap gap-1.5 ${size === "md" ? "text-sm" : "text-xs"}`}
    >
      {chips.map(({ key, value }) => {
        const Icon = SETTING_ICONS[key];
        const mono = key === "iso" || key === "shutter" || key === "aperture";
        return (
          <li
            key={key}
            className="flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-white"
          >
            <Icon className="size-3 shrink-0 opacity-80" aria-hidden />
            <span className={mono ? "font-mono" : ""}>{value}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function Gallery({ photos }: { photos: Photo[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [zoomed, setZoomed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fullImgRef = useRef<HTMLImageElement>(null);
  const zoomPaneRef = useRef<HTMLDivElement>(null);
  // Where in the frame the zoom click landed, 0–1 on each axis, so entering
  // zoom scrolls to what was clicked instead of the top-left corner.
  const zoomOrigin = useRef({ x: 0.5, y: 0.5 });
  // Pointer origin + scroll offset for a drag-pan, and whether this gesture
  // travelled far enough to count as a pan rather than a click.
  const dragFrom = useRef<{
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  const panned = useRef(false);

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback(
    (delta: number) =>
      setOpenIndex((i) =>
        i === null ? i : (i + delta + photos.length) % photos.length,
      ),
    [photos.length],
  );

  // Keyboard nav + scroll lock while the lightbox is open. Escape backs out of
  // zoom first, so it takes two presses to leave a zoomed photo entirely.
  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (zoomed) setZoomed(false);
        else close();
      } else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openIndex, close, step, zoomed]);

  // Every photo opens unzoomed and unloaded. A cached image can finish before
  // onLoad is attached, so read .complete on the way in rather than waiting for
  // an event that already fired — otherwise the spinner would never clear.
  useEffect(() => {
    if (openIndex === null) return;
    setZoomed(false);
    const img = fullImgRef.current;
    // .complete is also true for an image that already failed, and a failed
    // decode leaves naturalWidth at 0 — that's the only way to tell them apart
    // without waiting for an event that has already fired.
    if (!img?.complete) setStatus("loading");
    else setStatus(img.naturalWidth > 0 ? "ready" : "error");
  }, [openIndex]);

  // Warm both neighbours so stepping is usually instant. The spinner is the
  // fallback for a cold jump, not the normal path.
  useEffect(() => {
    if (openIndex === null) return;
    for (const delta of [1, -1]) {
      const i = (openIndex + delta + photos.length) % photos.length;
      const preload = new Image();
      preload.src = photos[i].src;
    }
  }, [openIndex, photos]);

  // Land the zoomed view on the point that was clicked.
  useEffect(() => {
    const pane = zoomPaneRef.current;
    if (!zoomed || !pane) return;
    pane.scrollTo({
      left: zoomOrigin.current.x * pane.scrollWidth - pane.clientWidth / 2,
      top: zoomOrigin.current.y * pane.scrollHeight - pane.clientHeight / 2,
    });
  }, [zoomed]);

  // Drag-to-pan, mouse only: touch and trackpad already scroll the pane
  // natively, and claiming those gestures would cost pinch-to-zoom.
  // Deliberately no setPointerCapture: capturing retargets the click that
  // follows pointerup to the pane, which would silently kill the zoom-out
  // handler on the button inside. The pane is full-bleed anyway, so plain
  // bubbling covers every pixel the pointer can reach.
  const startPan = (e: React.PointerEvent<HTMLDivElement>) => {
    const pane = zoomPaneRef.current;
    if (!pane || e.pointerType !== "mouse") return;
    dragFrom.current = {
      x: e.clientX,
      y: e.clientY,
      left: pane.scrollLeft,
      top: pane.scrollTop,
    };
    panned.current = false;
    setDragging(true);
  };

  const pan = (e: React.PointerEvent<HTMLDivElement>) => {
    const pane = zoomPaneRef.current;
    const from = dragFrom.current;
    if (!pane || !from) return;
    // Button released off-window, so pointerup never arrived: stop panning
    // rather than dragging the photo around under a mouse that isn't held.
    if (e.buttons === 0) return endPan();
    const dx = e.clientX - from.x;
    const dy = e.clientY - from.y;
    // A few pixels of slop, so a slightly shaky click still zooms back out.
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) panned.current = true;
    pane.scrollLeft = from.left - dx;
    pane.scrollTop = from.top - dy;
  };

  const endPan = () => {
    dragFrom.current = null;
    setDragging(false);
  };

  const active = openIndex === null ? null : photos[openIndex];

  return (
    <>
      <div className="gap-3 [column-fill:_balance] columns-1 sm:columns-2 lg:columns-3">
        {photos.map((photo, i) => (
          <button
            type="button"
            key={photo.name}
            onClick={() => setOpenIndex(i)}
            aria-label={`View ${photo.title}`}
            className="group relative mb-3 block w-full cursor-zoom-in overflow-hidden rounded-lg break-inside-avoid"
          >
            {/* biome-ignore lint/performance/noImgElement: thumbnails are pre-sized by scripts/gen-photos.mjs and served through the geo-gated /photographs route; next/image's optimizer would be a redundant layer in front of it */}
            <img
              src={photo.thumb}
              alt={photo.title}
              width={photo.width || undefined}
              height={photo.height || undefined}
              loading="lazy"
              decoding="async"
              className="block h-auto w-full transition-transform duration-300 ease-out group-hover:scale-[1.03]"
            />
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/10 to-transparent p-3 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
              <p className="mb-1.5 truncate text-left text-sm font-medium text-white">
                {photo.title}
              </p>
              <SettingChips settings={photo.settings} />
            </div>
          </button>
        ))}
      </div>

      {active && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4 backdrop-blur-sm sm:p-8"
        >
          {/* Full-bleed backdrop button: click (or Enter/Space) anywhere
              outside the image closes. Sits behind everything via -z-10, so
              the controls and the image take precedence. Being a real button,
              it carries keyboard semantics for free. */}
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute inset-0 -z-10 cursor-zoom-out"
          />

          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="size-6" />
          </button>

          {photos.length > 1 && (
            <>
              <NavButton side="left" onClick={() => step(-1)} />
              <NavButton side="right" onClick={() => step(1)} />
            </>
          )}

          {zoomed ? (
            <div
              ref={zoomPaneRef}
              onPointerDown={startPan}
              onPointerMove={pan}
              onPointerUp={endPan}
              onPointerCancel={endPan}
              className={`absolute inset-0 select-none overflow-auto overscroll-contain ${
                dragging ? "cursor-grabbing" : "cursor-grab"
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  // Swallow the click that ends a pan; otherwise dragging the
                  // photo around would drop you out of zoom on release.
                  if (panned.current) return;
                  setZoomed(false);
                }}
                aria-label={`Zoom out of ${active.title}`}
                className="block cursor-[inherit]"
              >
                {/* biome-ignore lint/performance/noImgElement: a 1:1 view of the CDN original is the whole point here — next/image would resample the pixels being inspected */}
                <img
                  src={active.src}
                  alt={active.title}
                  draggable={false}
                  className="max-w-none"
                />
              </button>
            </div>
          ) : (
            <div className="flex max-h-full max-w-full flex-col items-center gap-4">
              <button
                type="button"
                disabled={status !== "ready"}
                aria-label={`Zoom into ${active.title}`}
                onClick={(e) => {
                  const box = e.currentTarget.getBoundingClientRect();
                  zoomOrigin.current = {
                    x: (e.clientX - box.left) / box.width,
                    y: (e.clientY - box.top) / box.height,
                  };
                  setZoomed(true);
                }}
                // The manifest carries intrinsic dimensions, so the box can be
                // sized before a byte arrives: same footprint the photo will
                // occupy, no reflow when it lands, spinner centred in the middle
                // of it rather than in a collapsed sliver.
                style={{
                  aspectRatio: `${active.width} / ${active.height}`,
                  width: `min(100%, calc(80vh * ${active.width} / ${active.height}))`,
                }}
                className="relative flex max-h-[80vh] items-center justify-center overflow-hidden rounded-lg bg-white/5 enabled:cursor-zoom-in"
              >
                {/* biome-ignore lint/performance/noImgElement: full-res CDN original, sized to the viewport — next/image's optimizer would be a redundant layer in front of it */}
                <img
                  key={active.src}
                  ref={fullImgRef}
                  src={active.src}
                  alt={active.title}
                  onLoad={() => setStatus("ready")}
                  onError={() => setStatus("error")}
                  className={`block size-full rounded-lg object-contain transition-opacity duration-200 ${
                    status === "ready" ? "opacity-100" : "opacity-0"
                  }`}
                />
                {status === "loading" && (
                  <Loader2
                    aria-hidden
                    className="absolute size-8 animate-spin text-white/70"
                  />
                )}
                {status === "error" && (
                  <span className="absolute flex items-center gap-2 text-sm text-white/60">
                    <ImageOff aria-hidden className="size-5" />
                    Couldn’t load this one
                  </span>
                )}
              </button>
              <div className="flex flex-col items-center gap-2 text-center">
                <p className="text-base font-medium text-white">
                  {active.title}
                  {active.date && (
                    <span className="ml-2 font-normal text-white/50">
                      {active.date}
                    </span>
                  )}
                </p>
                <SettingChips settings={active.settings} size="md" />
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function NavButton({
  side,
  onClick,
}: {
  side: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={side === "left" ? "Previous photo" : "Next photo"}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`absolute top-1/2 z-10 -translate-y-1/2 rounded-full p-2 text-3xl leading-none text-white/70 transition-colors hover:bg-white/10 hover:text-white ${
        side === "left" ? "left-2 sm:left-4" : "right-2 sm:right-4"
      }`}
    >
      {side === "left" ? "‹" : "›"}
    </button>
  );
}
