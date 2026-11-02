"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as MaplibreMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { STATUS_COLORS } from "@/lib/palette";
import type { AssetStatus } from "@/lib/types";

export type CityMapPoint = {
  id: string;
  lat: number;
  lng: number;
  status: AssetStatus;
};

/** Free vector tiles, no API key (OpenStreetMap data via OpenFreeMap). */
const STYLE_URL = "https://tiles.openfreemap.org/styles/dark";

/** Viseu — Centro Histórico & Rossio. Used until points arrive. */
const VISEU_CENTER: [number, number] = [-7.9128, 40.6585];

/** Re-tint the base style towards the Urvox ink palette. */
function applyBrandTint(map: MaplibreMap) {
  const tint: Array<[string, string, string]> = [
    ["background", "background-color", "#0a1310"],
    ["building", "fill-color", "#1a2e27"],
  ];
  for (const [layer, prop, color] of tint) {
    if (map.getLayer(layer)) map.setPaintProperty(layer, prop, color);
  }
}

function styleMarker(el: HTMLElement, point: CityMapPoint, selected: boolean) {
  el.style.setProperty("--marker-color", STATUS_COLORS[point.status]);
  el.dataset.status = point.status;
  el.dataset.selected = selected ? "true" : "false";
}

export function CityMap({
  points,
  selectedId,
  onSelect,
  ariaLabel = "Mapa do Centro Histórico de Viseu",
}: {
  points: CityMapPoint[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  ariaLabel?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const markersRef = useRef(new Map<string, Marker>());
  const markerCtorRef = useRef<typeof Marker | null>(null);
  const fittedRef = useRef(false);
  const onSelectRef = useRef(onSelect);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // Create the map once. maplibre-gl touches `window`, so load it client-side only.
  useEffect(() => {
    let cancelled = false;
    const markers = markersRef.current;

    import("maplibre-gl").then(({ default: maplibregl }) => {
      if (cancelled || !containerRef.current) return;
      markerCtorRef.current = maplibregl.Marker;
      const map = new maplibregl.Map({
        container: containerRef.current,
        style: STYLE_URL,
        center: VISEU_CENTER,
        zoom: 15,
        attributionControl: { compact: true },
        cooperativeGestures: false,
      });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
      map.on("style.load", () => applyBrandTint(map));
      mapRef.current = map;
      map.once("load", () => {
        if (!cancelled) setReady(true);
      });
    });

    return () => {
      cancelled = true;
      markers.forEach((m) => m.remove());
      markers.clear();
      mapRef.current?.remove();
      mapRef.current = null;
      fittedRef.current = false;
    };
  }, []);

  // Keep markers in sync with the (polled) points and the selection.
  useEffect(() => {
    const map = mapRef.current;
    const MarkerCtor = markerCtorRef.current;
    if (!ready || !map || !MarkerCtor) return;
    const markers = markersRef.current;
    const seen = new Set<string>();

    for (const point of points) {
      seen.add(point.id);
      let marker = markers.get(point.id);
      if (!marker) {
        const el = document.createElement("button");
        el.type = "button";
        el.className = "urvox-marker";
        el.setAttribute("aria-label", point.id);
        el.addEventListener("click", (event) => {
          event.stopPropagation();
          onSelectRef.current(point.id);
        });
        marker = new MarkerCtor({ element: el }).setLngLat([point.lng, point.lat]).addTo(map);
        markers.set(point.id, marker);
      } else {
        marker.setLngLat([point.lng, point.lat]);
      }
      styleMarker(marker.getElement(), point, point.id === selectedId);
    }

    for (const [id, marker] of markers) {
      if (!seen.has(id)) {
        marker.remove();
        markers.delete(id);
      }
    }

    if (!fittedRef.current && points.length > 0) {
      const lngs = points.map((p) => p.lng);
      const lats = points.map((p) => p.lat);
      map.fitBounds(
        [
          [Math.min(...lngs), Math.min(...lats)],
          [Math.max(...lngs), Math.max(...lats)],
        ],
        { padding: 40, maxZoom: 17, duration: 0 },
      );
      fittedRef.current = true;
    }
  }, [ready, points, selectedId]);

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={ariaLabel}
      className="urvox-map h-full w-full overflow-hidden rounded-2xl border border-ink-3 bg-ink-2/60"
    />
  );
}
