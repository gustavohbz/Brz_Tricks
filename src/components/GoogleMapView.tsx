/* =========================================================
   GoogleMapView — mapa do Google carregado sob demanda
   ---------------------------------------------------------
   • Carrega a Maps JavaScript API uma única vez (script global).
   • Usa a chave pública de navegador (VITE_...BROWSER_KEY).
   • Mostra um marcador na coordenada da pista.
   ========================================================= */
import { useEffect, useRef, useState } from "react";

const BROWSER_KEY = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"] as
  | string
  | undefined;
const TRACKING_ID = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID"] as
  | string
  | undefined;

let mapsPromise: Promise<void> | null = null;

/** Injeta o script da Maps JS API (só na primeira chamada). */
function loadMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("sem window"));
  if (mapsPromise) return mapsPromise;
  if (!BROWSER_KEY) return Promise.reject(new Error("sem chave do Google Maps"));

  mapsPromise = new Promise<void>((resolve, reject) => {
    const w = window as unknown as Record<string, unknown>;
    w["__initGoogleMaps"] = () => resolve();
    const script = document.createElement("script");
    const channel = TRACKING_ID ? `&channel=${TRACKING_ID}` : "";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${BROWSER_KEY}&loading=async&callback=__initGoogleMaps${channel}`;
    script.async = true;
    script.onerror = () => reject(new Error("falha ao carregar o Google Maps"));
    document.head.appendChild(script);
  });
  return mapsPromise;
}

export function GoogleMapView({
  lat,
  lng,
  title,
  zoom = 16,
}: {
  lat: number;
  lng: number;
  title: string;
  zoom?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    loadMaps()
      .then(() => {
        if (cancelled || !ref.current) return;
        const g = (window as unknown as { google: any }).google;
        const map = new g.maps.Map(ref.current, {
          center: { lat, lng },
          zoom,
          mapTypeControl: false,
          streetViewControl: false,
avoidGoogleLogoOverlap: undefined,
        });
        new g.maps.Marker({ position: { lat, lng }, map, title });
      })
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [lat, lng, zoom, title]);

  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <div>
      {error ? (
        <div className="flex aspect-video w-full items-center justify-center rounded-md bg-secondary px-4 text-center text-xs text-muted-foreground">
          Não foi possível carregar o mapa aqui.
        </div>
      ) : (
        <div ref={ref} className="aspect-video w-full rounded-md bg-secondary" />
      )}
      <a
        href={mapsLink}
        target="_blank"
        rel="noreferrer"
        className="text-display mt-2 inline-block text-xs text-accent hover:text-primary"
      >
        Abrir no Google Maps →
      </a>
    </div>
  );
}
