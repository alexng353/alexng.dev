"use client";

import type { Photo, PhotoSettings } from "@lib/photos";
import { Aperture, Camera, Gauge, Timer, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

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

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback(
    (delta: number) =>
      setOpenIndex((i) =>
        i === null ? i : (i + delta + photos.length) % photos.length,
      ),
    [photos.length],
  );

  // Keyboard nav + scroll lock while the lightbox is open.
  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openIndex, close, step]);

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
            className="absolute right-4 top-4 rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="size-6" />
          </button>

          {photos.length > 1 && (
            <>
              <NavButton side="left" onClick={() => step(-1)} />
              <NavButton side="right" onClick={() => step(1)} />
            </>
          )}

          <div className="flex max-h-full max-w-full flex-col items-center gap-4">
            {/* biome-ignore lint/performance/noImgElement: full-res view served through the geo-gated /photographs route; sized to the viewport, not a candidate for next/image optimization */}
            <img
              src={active.src}
              alt={active.title}
              className="max-h-[80vh] max-w-full rounded-lg object-contain"
            />
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
      className={`absolute top-1/2 -translate-y-1/2 rounded-full p-2 text-3xl leading-none text-white/70 transition-colors hover:bg-white/10 hover:text-white ${
        side === "left" ? "left-2 sm:left-4" : "right-2 sm:right-4"
      }`}
    >
      {side === "left" ? "‹" : "›"}
    </button>
  );
}
