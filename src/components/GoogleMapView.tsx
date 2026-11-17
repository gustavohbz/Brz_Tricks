/* =========================================================
   GoogleMapView — Google Maps carregado sob demanda
   ---------------------------------------------------------
   A chave do navegador é pública por natureza: restrinja-a por
   HTTP referrer e permita somente Maps JavaScript API no Google Cloud.
   ========================================================= */
import { useEffect, useRef, useState } from "react";

const BROWSER_KEY = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"] as
  | string
  | undefined;
const TRACKING_ID = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID"] as
  | string
  | undefined;
const CALLBACK_NAME = "__brzTricksGoogleMapsReady";
const LOAD_TIMEOUT_MS = 15_000;

let mapsPromise: Promise<void> | null = null;

function hasMapsApi(): boolean {
  const google = (window as unknown as { google?: { maps?: { Map?: unknown } } }).google;
  return typeof google?.maps?.Map === "function";
}

/** Injeta uma única solicitação; falhas limpam o estado para permitir nova tentativa. */
function loadMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Google Maps indisponível."));
  if (hasMapsApi()) return Promise.resolve();
  if (mapsPromise) return mapsPromise;
  if (!BROWSER_KEY?.trim()) {
    return Promise.reject(new Error("A chave do Google Maps não está configurada."));
  }

  const request = new Promise<void>((resolve, reject) => {
    const w = window as unknown as Record<string, unknown>;
    const script = document.createElement("script");
    const timeout = window.setTimeout(
      () => fail(new Error("Tempo limite ao carregar o Google Maps.")),
      LOAD_TIMEOUT_MS,
    );

    const cleanup = () => {
      window.clearTimeout(timeout);
      delete w[CALLBACK_NAME];
    };
    const fail = (error: Error) => {
      cleanup();
      script.remove();
      reject(error);
    };

    w[CALLBACK_NAME] = () => {
      cleanup();
      resolve();
    };

    const params = new URLSearchParams({
      key: BROWSER_KEY.trim(),
      loading: "async",
      callback: CALLBACK_NAME,
      language: "pt-BR",
      region: "BR",
    });
    if (TRACKING_ID?.trim()) params.set("channel", TRACKING_ID.trim());

    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.onerror = () => fail(new Error("Falha ao carregar o Google Maps."));
    document.head.appendChild(script);
  });

  mapsPromise = request.catch((error: unknown) => {
    mapsPromise = null;
    throw error;
  });
  return mapsPromise;
}

function validCoordinates(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
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
  const coordinatesAreValid = validCoordinates(lat, lng);
  const mapsLink = coordinatesAreValid
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    : null;

  useEffect(() => {
    let cancelled = false;
    setError("");

    if (!validCoordinates(lat, lng)) {
      setError("A localização desta pista precisa ser conferida.");
      return () => {
        cancelled = true;
      };
    }

    loadMaps()
      .then(() => {
        if (cancelled || !ref.current) return;
        const google = (window as unknown as { google?: { maps?: any } }).google;
        if (typeof google?.maps?.Map !== "function" || typeof google?.maps?.Marker !== "function") {
          throw new Error("Google Maps não inicializou corretamente.");
        }
        const map = new google.maps.Map(ref.current, {
          center: { lat, lng },
          zoom,
          mapTypeControl: false,
          streetViewControl: false,
        });
        new google.maps.Marker({ position: { lat, lng }, map, title });
      })
      .catch(() => {
        if (!cancelled) setError("Não foi possível carregar o mapa aqui.");
      });

    return () => {
      cancelled = true;
    };
  }, [lat, lng, zoom, title]);

  return (
    <div>
      {error ? (
        <div
          role="status"
          className="flex aspect-video w-full items-center justify-center rounded-md bg-secondary px-4 text-center text-xs text-muted-foreground"
        >
          {error}
        </div>
      ) : (
        <div
          ref={ref}
          role="region"
          aria-label={`Mapa de ${title}`}
          className="aspect-video w-full rounded-md bg-secondary"
        />
      )}
      {mapsLink ? (
        <a
          href={mapsLink}
          target="_blank"
          rel="noreferrer"
          className="text-display mt-2 inline-flex min-h-11 items-center text-xs text-accent hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Abrir localização de {title} no Google Maps →
        </a>
      ) : null}
    </div>
  );
}
