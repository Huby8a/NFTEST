import React, { useMemo, useRef, useState } from "react";

/**
 * NeuroFit — Clickable Anatomy Diagram (Front/Back)
 * -------------------------------------------------
 * What this gives you
 * - A responsive image of a body diagram (front or back)
 * - Invisible, accessible buttons layered over specific muscle regions
 * - Hover outline + active highlight for the currently hovered/selected region
 * - Callback onClick(region) so you can open a drawer/modal or route to /exercises?muscle=...
 * - A "debug" toggle to see the hotspot boxes while you tune coordinates
 *
 * How to use
 * <AnatomyDiagram
 *   view="front"
 *   imageSrc="/images/anatomy/front.png"   // your asset
 *   onSelect={(r) => console.log("Picked:", r.key)}
 * />
 *
 * Coordinates are percentages so it stays responsive. Start with the sample
 * regions below and tweak in DEBUG mode. Click anywhere to log % coords.
 */

// Types
export type AnatomyView = "front" | "back";
export type MuscleRegion = {
  key: string;           // e.g., "chest"
  label: string;         // e.g., "Chest (Pectorals)"
  view: AnatomyView;     // "front" or "back"
  // Normalized % box within the image: left, top, width, height
  box: { left: number; top: number; width: number; height: number };
};

// --- SAMPLE HOTSPOTS -------------------------------------------------------
// These are starter boxes that work reasonably with a front/back full-body
// illustration that has the body roughly centered with some top/bottom margin.
// You will likely tweak these in DEBUG mode to fit your exact artwork.
const SAMPLE_REGIONS: MuscleRegion[] = [
  // FRONT
  { key: "shoulders", label: "Deltoids", view: "front", box: { left: 42.8, top: 21.0, width: 14.4, height: 6.0 } },
  { key: "chest",     label: "Chest (Pectorals)", view: "front", box: { left: 41.0, top: 27.5, width: 18.0, height: 7.5 } },
  { key: "biceps",    label: "Biceps", view: "front", box: { left: 35.5, top: 29.5, width: 7.0, height: 10.0 } },
  { key: "triceps",   label: "Triceps", view: "front", box: { left: 57.5, top: 29.5, width: 7.0, height: 10.0 } },
  { key: "abs",       label: "Abs (Rectus Abdominis)", view: "front", box: { left: 45.0, top: 36.9, width: 10.0, height: 11.0 } },
  { key: "obliques",  label: "Obliques", view: "front", box: { left: 39.5, top: 38.0, width: 21.0, height: 10.0 } },
  { key: "quads",     label: "Quads", view: "front", box: { left: 44.0, top: 52.0, width: 12.0, height: 17.0 } },
  { key: "adductors", label: "Adductors", view: "front", box: { left: 47.0, top: 50.0, width: 6.0, height: 10.0 } },
  { key: "calves_f",  label: "Calves", view: "front", box: { left: 45.3, top: 72.5, width: 9.4, height: 12.0 } },

  // BACK
  { key: "traps",     label: "Trapezius", view: "back", box: { left: 44.0, top: 22.5, width: 12.0, height: 7.0 } },
  { key: "lats",      label: "Lats", view: "back", box: { left: 41.0, top: 30.0, width: 18.0, height: 10.0 } },
  { key: "erectors",  label: "Spinal Erectors", view: "back", box: { left: 46.0, top: 38.0, width: 8.0, height: 11.0 } },
  { key: "glutes",    label: "Glutes", view: "back", box: { left: 44.0, top: 49.5, width: 12.0, height: 10.0 } },
  { key: "hamstrings",label: "Hamstrings", view: "back", box: { left: 44.0, top: 57.5, width: 12.0, height: 14.0 } },
  { key: "calves_b",  label: "Calves", view: "back", box: { left: 45.3, top: 73.0, width: 9.4, height: 12.0 } },
];

// Utility to clamp % values
const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));

export default function AnatomyDiagram({
  view = "front",
  imageSrc,
  regions = SAMPLE_REGIONS,
  onSelect,
  className = "",
  showViewToggle = true,
  initialDebug = false,
}: {
  view?: AnatomyView;
  imageSrc: string;              // required: your body diagram image
  regions?: MuscleRegion[];      // optional: override hotspots
  onSelect?: (region: MuscleRegion) => void;
  className?: string;
  showViewToggle?: boolean;
  initialDebug?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [debug, setDebug] = useState<boolean>(initialDebug);
  const [currentView, setCurrentView] = useState<AnatomyView>(view);

  const filtered = useMemo(
    () => regions.filter((r) => r.view === currentView),
    [regions, currentView]
  );

  // For quick hotspot authoring: clicking anywhere logs % coords
  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (!debug || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clamp(((e.clientX - rect.left) / rect.width) * 100);
    const y = clamp(((e.clientY - rect.top) / rect.height) * 100);
    console.log(`Clicked @ left:${x.toFixed(2)}%, top:${y.toFixed(2)}%`);
  };

  return (
    <div className={`w-full max-w-3xl mx-auto ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-100">Body Diagram</h2>
        <div className="flex items-center gap-2">
          {showViewToggle && (
            <button
              type="button"
              onClick={() => setCurrentView((v) => (v === "front" ? "back" : "front"))}
              className="rounded-xl border border-slate-600/60 px-3 py-1.5 text-sm text-slate-200 hover:bg-slate-600/30"
            >
              {currentView === "front" ? "Show Back" : "Show Front"}
            </button>
          )}
          <button
            type="button"
            onClick={() => setDebug((d) => !d)}
            className="rounded-xl border border-slate-600/60 px-3 py-1.5 text-sm text-slate-400 hover:text-slate-100 hover:bg-slate-600/30"
            aria-pressed={debug}
          >
            {debug ? "Hide Boxes" : "Debug Boxes"}
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        onClick={handleBackgroundClick}
        className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-slate-800/60 ring-1 ring-black/20 shadow-xl"
      >
        {/* Body image */}
        <img
          src={imageSrc}
          alt={`Anatomy ${currentView} view`}
          className="absolute inset-0 h-full w-full object-contain select-none pointer-events-none"
          draggable={false}
        />

        {/* Clickable invisible hotspots */}
        {filtered.map((r) => (
          <button
            key={r.key}
            aria-label={r.label}
            title={r.label}
            onMouseEnter={() => setHoverKey(r.key)}
            onMouseLeave={() => setHoverKey((k) => (k === r.key ? null : k))}
            onClick={(e) => {
              e.stopPropagation();
              setActiveKey(r.key);
              onSelect?.(r);
            }}
            className="absolute outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70"
            style={{
              left: `${clamp(r.box.left)}%`,
              top: `${clamp(r.box.top)}%`,
              width: `${clamp(r.box.width)}%`,
              height: `${clamp(r.box.height)}%`,
            }}
          >
            {/* Invisible clickable layer */}
            <span className="sr-only">{r.label}</span>

            {/* Hover/Active visual (subtle) */}
            <span
              className={`block h-full w-full rounded-xl transition-all duration-150 ${
                hoverKey === r.key || activeKey === r.key
                  ? "ring-2 ring-emerald-400/80 bg-emerald-400/10"
                  : "ring-1 ring-transparent"
              } ${debug ? "bg-rose-500/25 ring-rose-400/70" : ""}`}
            />
          </button>
        ))}

        {/* Optional legend chip on hover */}
        {hoverKey && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-900/80 px-3 py-1 text-xs text-slate-100 border border-slate-700/60 backdrop-blur">
            {filtered.find((r) => r.key === hoverKey)?.label}
          </div>
        )}
      </div>
    </div>
  );
}

// --- OPTIONAL: Example usage ------------------------------------------------
// Place this in your Body Diagram route/page and pass your own artwork assets.
//
// export function BodyDiagramPage() {
//   return (
//     <div className="p-6">
//       <AnatomyDiagram
//         view="front"
//         imageSrc="/assets/anatomy/front-view.png"
//         onSelect={(r) => {
//           // navigate(`/exercises?muscle=${r.key}`) or open modal
//           console.log("Go to:", r.key);
//         }}
//       />
//     </div>
//   );
// }
