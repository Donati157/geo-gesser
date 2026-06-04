import { useEffect, useRef, useState } from "react";
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
  onConfirm?: () => void; // confirmar palpite (usado no modo tela cheia)
}

// Camadas de mapa disponíveis (botão de camadas, estilo FreeGuessr).
const LAYERS = [
  {
    name: "Ruas",
    icon: "🗺️",
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    opts: { subdomains: "abcd", maxZoom: 19 } as L.TileLayerOptions,
    labels: false,
  },
  {
    name: "Satélite",
    icon: "🛰️",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    opts: { maxZoom: 19 } as L.TileLayerOptions,
    labels: true, // adiciona nomes de lugares por cima
  },
  {
    name: "Escuro",
    icon: "🌙",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    opts: { subdomains: "abcd", maxZoom: 19 } as L.TileLayerOptions,
    labels: false,
  },
];
const LABELS_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}";

const pin = (cls: string, label = "") =>
  L.divIcon({
    className: "",
    html: `<div class="map-pin ${cls}"><span>${label}</span></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
  });

export default function GuessMap({ interactive, pick, onPick, reveal, onConfirm }: Props) {
  const elRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const guessMarker = useRef<L.Marker | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const baseRef = useRef<L.TileLayer | null>(null);
  const labelsRef = useRef<L.TileLayer | null>(null);
  const [layerIdx, setLayerIdx] = useState(0);
  const [fs, setFs] = useState(false);

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
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 50);

    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(elRef.current);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Troca a camada base (ruas / satélite / escuro).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const cfg = LAYERS[layerIdx];
    if (baseRef.current) baseRef.current.remove();
    if (labelsRef.current) {
      labelsRef.current.remove();
      labelsRef.current = null;
    }
    baseRef.current = L.tileLayer(cfg.url, cfg.opts).addTo(map);
    baseRef.current.bringToBack();
    if (cfg.labels) {
      labelsRef.current = L.tileLayer(LABELS_URL, { maxZoom: 19 }).addTo(map);
    }
  }, [layerIdx]);

  // Avisa o Leaflet quando entra/sai de tela cheia (muda o tamanho).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const t = setTimeout(() => map.invalidateSize(), 60);
    return () => clearTimeout(t);
  }, [fs]);

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

  // Camada de revelação: local real + palpites.
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

  const cycleLayer = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLayerIdx((i) => (i + 1) % LAYERS.length);
  };
  const next = LAYERS[(layerIdx + 1) % LAYERS.length];

  return (
    <div className={`guess-map-wrap ${fs ? "fs" : ""}`}>
      <div className="guess-map" ref={elRef} />

      <div className="map-ctrls">
        <button className="map-ctrl layers" title={`Trocar para ${next.name}`} onClick={cycleLayer}>
          {LAYERS[layerIdx].icon} <span className="lab">{LAYERS[layerIdx].name}</span>
        </button>
        <button
          className="map-ctrl"
          title={fs ? "Sair da tela cheia" : "Tela cheia"}
          onClick={(e) => {
            e.stopPropagation();
            setFs((v) => !v);
          }}
        >
          {fs ? "✕" : "⛶"}
        </button>
      </div>

      {fs && interactive && pick && onConfirm && (
        <button
          className="btn btn-primary map-fs-confirm"
          onClick={(e) => {
            e.stopPropagation();
            setFs(false);
            onConfirm();
          }}
        >
          ✓ Cravar palpite
        </button>
      )}
    </div>
  );
}
