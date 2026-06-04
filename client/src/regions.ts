// Regiões com boa cobertura no Mapillary (mesma lista do servidor).
// [minLng, minLat, maxLng, maxLat]
export interface Region {
  name: string;
  bbox: [number, number, number, number];
}

export const REGIONS: Region[] = [
  { name: "São Paulo, Brasil", bbox: [-46.7, -23.62, -46.58, -23.52] },
  { name: "Rio de Janeiro, Brasil", bbox: [-43.25, -22.98, -43.15, -22.88] },
  { name: "Lisboa, Portugal", bbox: [-9.18, 38.7, -9.1, 38.76] },
  { name: "Porto, Portugal", bbox: [-8.65, 41.13, -8.58, 41.18] },
  { name: "Madri, Espanha", bbox: [-3.74, 40.39, -3.65, 40.46] },
  { name: "Barcelona, Espanha", bbox: [2.13, 41.36, 2.21, 41.42] },
  { name: "Paris, França", bbox: [2.3, 48.84, 2.39, 48.89] },
  { name: "Berlim, Alemanha", bbox: [13.36, 52.49, 13.45, 52.54] },
  { name: "Munique, Alemanha", bbox: [11.53, 48.12, 11.6, 48.16] },
  { name: "Amsterdã, Holanda", bbox: [4.86, 52.35, 4.93, 52.39] },
  { name: "Estocolmo, Suécia", bbox: [18.03, 59.31, 18.1, 59.35] },
  { name: "Helsinque, Finlândia", bbox: [24.91, 60.15, 24.98, 60.19] },
  { name: "Oslo, Noruega", bbox: [10.71, 59.9, 10.78, 59.93] },
  { name: "Londres, Reino Unido", bbox: [-0.14, 51.49, -0.07, 51.53] },
  { name: "Roma, Itália", bbox: [12.46, 41.88, 12.52, 41.92] },
  { name: "Viena, Áustria", bbox: [16.35, 48.19, 16.4, 48.22] },
  { name: "Praga, República Tcheca", bbox: [14.4, 50.07, 14.45, 50.1] },
  { name: "Atenas, Grécia", bbox: [23.71, 37.96, 23.76, 38.0] },
  { name: "Istambul, Turquia", bbox: [28.95, 41.0, 29.02, 41.05] },
  { name: "Nova York, EUA", bbox: [-74.01, 40.71, -73.95, 40.77] },
  { name: "São Francisco, EUA", bbox: [-122.45, 37.74, -122.39, 37.79] },
  { name: "Chicago, EUA", bbox: [-87.65, 41.86, -87.6, 41.91] },
  { name: "Los Angeles, EUA", bbox: [-118.3, 34.02, -118.22, 34.08] },
  { name: "Toronto, Canadá", bbox: [-79.4, 43.63, -79.36, 43.67] },
  { name: "Cidade do México, México", bbox: [-99.18, 19.4, -99.12, 19.45] },
  { name: "Buenos Aires, Argentina", bbox: [-58.43, -34.62, -58.36, -34.56] },
  { name: "Santiago, Chile", bbox: [-70.68, -33.46, -70.62, -33.41] },
  { name: "Bogotá, Colômbia", bbox: [-74.09, 4.6, -74.04, 4.66] },
  { name: "Tóquio, Japão", bbox: [139.69, 35.65, 139.75, 35.7] },
  { name: "Osaka, Japão", bbox: [135.48, 34.66, 135.53, 34.7] },
  { name: "Seul, Coreia do Sul", bbox: [126.97, 37.54, 127.03, 37.58] },
  { name: "Taipé, Taiwan", bbox: [121.52, 25.03, 121.57, 25.07] },
  { name: "Cingapura", bbox: [103.83, 1.28, 103.87, 1.31] },
  { name: "Bangkok, Tailândia", bbox: [100.49, 13.72, 100.55, 13.77] },
  { name: "Sydney, Austrália", bbox: [151.19, -33.88, 151.23, -33.85] },
  { name: "Melbourne, Austrália", bbox: [144.95, -37.82, 144.99, -37.8] },
  { name: "Auckland, Nova Zelândia", bbox: [174.74, -36.86, 174.78, -36.84] },
  { name: "Cidade do Cabo, África do Sul", bbox: [18.4, -33.93, 18.45, -33.9] },
  { name: "Nairóbi, Quênia", bbox: [36.8, -1.3, 36.84, -1.27] },
  { name: "Tel Aviv, Israel", bbox: [34.76, 32.06, 34.8, 32.09] },
  { name: "Dubai, Emirados Árabes", bbox: [55.26, 25.18, 55.3, 25.22] },
  { name: "Budapeste, Hungria", bbox: [19.04, 47.49, 19.08, 47.51] },
  { name: "Varsóvia, Polônia", bbox: [21.0, 52.22, 21.04, 52.25] },
  { name: "Copenhague, Dinamarca", bbox: [12.56, 55.67, 12.6, 55.69] },
  { name: "Dublin, Irlanda", bbox: [-6.28, 53.33, -6.24, 53.36] },
  { name: "Bruxelas, Bélgica", bbox: [4.34, 50.84, 4.38, 50.86] },
  { name: "Zurique, Suíça", bbox: [8.52, 47.36, 8.56, 47.39] },
  { name: "Montevidéu, Uruguai", bbox: [-56.2, -34.91, -56.16, -34.88] },

  // --- Regiões rurais / interior (estradas e campo, poucas pistas) ---
  { name: "Interior da França", bbox: [1.0, 46.0, 4.5, 48.4] },
  { name: "Campo da Alemanha", bbox: [8.5, 49.5, 12.0, 51.5] },
  { name: "Campo da Holanda/Bélgica", bbox: [4.0, 50.8, 6.5, 52.3] },
  { name: "Interior da Espanha", bbox: [-4.5, 39.0, -1.5, 41.4] },
  { name: "Campo da Inglaterra", bbox: [-2.5, 51.0, 0.3, 52.8] },
  { name: "Interior da Suécia", bbox: [13.0, 57.0, 16.5, 59.2] },
  { name: "Campo da Itália", bbox: [10.5, 43.5, 13.0, 45.4] },
  { name: "Interior da Polônia", bbox: [17.0, 51.0, 21.0, 53.0] },
  { name: "Campo da Dinamarca", bbox: [9.0, 55.3, 12.0, 56.8] },
  { name: "Interior dos EUA (Meio-Oeste)", bbox: [-97.5, 42.0, -91.0, 45.5] },
  { name: "Interior do Brasil", bbox: [-49.0, -22.5, -45.0, -20.0] },
  { name: "Pampa (Argentina/Uruguai)", bbox: [-60.0, -35.0, -56.0, -32.5] },
];

export function randomRegion(): Region {
  return REGIONS[Math.floor(Math.random() * REGIONS.length)];
}
