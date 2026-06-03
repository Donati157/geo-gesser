import { useEffect, useRef } from "react";
import L from "leaflet";
import type { RoundResult } from "../types";

interface RevealData {
  actual: { lat: number; lng: number };
  results: RoundResult[];
  you: string;
}

interface Props {
  interactive: boolean;
  pick: { lat: number; lng: number } | null;
  onPick: (lat: number, lng: number) => void;
  reveal: RevealData | null;
}

// Ícones desenhados em CSS (divIcon) para não depender de assets de imagem.
const pin = (cls: string, label = "") =>
  L.divIcon({
    className: "",
    html: `<div class="map-pin ${cls}"><span>${label}</span></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
  });

export default function GuessMap({ interactive, pick, onPick, reveal }: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const guessMarker = useRef<L.Marker | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  // Cria o mapa uma vez.
  useEffect(() => {
    if (!elRef.current || mapRef.current) return;
    const map = L.map(elRef.current, {
      center: [20, 0],
      zoom: 2,
      worldCopyJump: true,
      zoomControl: true,
      attributionControl: false,
    });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      subdomains: "abcd",
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 50);

    // Quando o container muda de tamanho (ex: abrir/expandir o mapa), o Leaflet
    // precisa ser avisado, senão só renderiza tiles do tamanho antigo (fica preto).
    const ro = new ResizeObserver(() => {
      map.invalidateSize();
    });
    ro.observe(elRef.current);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Clique para palpitar.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const handler = (e: L.LeafletMouseEvent) => {
      if (!interactive) return;
      onPick(e.latlng.lat, e.latlng.lng);
    };
    map.on("click", handler);
    return () => {
      map.off("click", handler);
    };
  }, [interactive, onPick]);

  // Marcador do palpite atual.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (guessMarker.current) {
      guessMarker.current.remove();
      guessMarker.current = null;
    }
    if (pick && !reveal) {
      guessMarker.current = L.marker([pick.lat, pick.lng], { icon: pin("you", "📍") }).addTo(map);
    }
  }, [pick, reveal]);

  // Camada de revelação: local real + palpites de todo mundo.
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    if (!reveal) return;

    const { actual, results, you } = reveal;
    const bounds: L.LatLngExpression[] = [[actual.lat, actual.lng]];

    L.marker([actual.lat, actual.lng], { icon: pin("target", "🎯") })
      .addTo(layer)
      .bindTooltip("Local real", { direction: "top" });

    for (const r of results) {
      if (!r.guess) continue;
      const mine = r.id === you;
      L.marker([r.guess.lat, r.guess.lng], { icon: pin(mine ? "you" : "other", mine ? "📍" : "") })
        .addTo(layer)
        .bindTooltip(`${r.name} — ${r.points} pts`, { direction: "top" });
      L.polyline(
        [
          [r.guess.lat, r.guess.lng],
          [actual.lat, actual.lng],
        ],
        { color: mine ? "#22d3ee" : "#94a3b8", weight: mine ? 3 : 1.5, dashArray: mine ? "" : "4 6", opacity: 0.8 }
      ).addTo(layer);
      bounds.push([r.guess.lat, r.guess.lng]);
    }

    if (bounds.length > 1) {
      map.fitBounds(L.latLngBounds(bounds as L.LatLngTuple[]).pad(0.3));
    } else {
      map.setView([actual.lat, actual.lng], 5);
    }
  }, [reveal]);

  return <div className="guess-map" ref={elRef} />;
}
