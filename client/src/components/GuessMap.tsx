import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import type { RoundResult } from "../types";
import { formatDist } from "../scoring";
import { findCountry } from "../countries";

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

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY as string | undefined;

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
  const [fs, setFs] = useState(false);

  // Cria o mapa uma vez.
  useEffect(() => {
    if (!elRef.current || mapRef.current) return;
    const map = L.map(elRef.current, {
      center: [20, 0],
      zoom: 2,
      worldCopyJump: true,
      zoomControl: true,
      attributionControl: true,
    });
    map.attributionControl.setPrefix(false);
    // Mapa detalhado (ruas, bairros, POIs) via MapTiler Streets. Cai pro CARTO
    // se a chave não estiver configurada.
    if (MAPTILER_KEY) {
      L.tileLayer(`https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`, {
        tileSize: 512,
        zoomOffset: -1,
        minZoom: 1,
        maxZoom: 20,
        crossOrigin: true,
        attribution:
          '<a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank">OSM</a>',
      }).addTo(map);
    } else {
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);
    }
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

  // Camada de revelação: país pintado + local real + palpites + distância.
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    if (!reveal) return;
    let cancelled = false;

    const { actual, results, you } = reveal;
    const bounds: L.LatLngExpression[] = [[actual.lat, actual.lng]];

    // Pinta o país do local real (carrega contornos sob demanda).
    findCountry(actual.lat, actual.lng).then((feat) => {
      if (cancelled || !feat || !layerRef.current) return;
      L.geoJSON(feat as any, {
        style: { color: "#ef4444", weight: 1.5, fillColor: "#ef4444", fillOpacity: 0.22 },
        interactive: false,
      }).addTo(layerRef.current);
    });

    // Bandeira no local real.
    L.marker([actual.lat, actual.lng], { icon: pin("target", "🏁") })
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
        { color: "#ef4444", weight: mine ? 3 : 1.5, dashArray: mine ? "" : "5 6", opacity: 0.9 }
      ).addTo(layer);
      // Distância escrita no meio da linha.
      if (typeof r.distanceKm === "number") {
        const mid: L.LatLngTuple = [(r.guess.lat + actual.lat) / 2, (r.guess.lng + actual.lng) / 2];
        L.marker(mid, {
          icon: L.divIcon({ className: "", html: `<div class="dist-label">${formatDist(r.distanceKm)}</div>`, iconSize: [0, 0] }),
          interactive: false,
        }).addTo(layer);
      }
      bounds.push([r.guess.lat, r.guess.lng]);
    }

    if (bounds.length > 1) {
      map.fitBounds(L.latLngBounds(bounds as L.LatLngTuple[]).pad(0.3));
    } else {
      map.setView([actual.lat, actual.lng], 5);
    }

    return () => {
      cancelled = true;
    };
  }, [reveal]);

  return (
    <div className={`guess-map-wrap ${fs ? "fs" : ""}`}>
      <div className="guess-map" ref={elRef} />

      <button
        className="map-ctrl fs-btn"
        title={fs ? "Sair da tela cheia" : "Tela cheia"}
        onClick={(e) => {
          e.stopPropagation();
          setFs((v) => !v);
        }}
      >
        {fs ? "✕" : "⛶"}
      </button>

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
