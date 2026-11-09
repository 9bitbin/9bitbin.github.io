// Live-location map helpers. Pure functions (no DOM), so they can be tested in node (tests/map.test.js).
// Points are {lat, lng}. Distances are in metres.

export function haversine(a, b) {
  const R = 6371000, toR = Math.PI / 180;
  const dLat = (b.lat - a.lat) * toR, dLng = (b.lng - a.lng) * toR;
  const la1 = a.lat * toR, la2 = b.lat * toR;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}
export function bearing(a, b) {
  const toR = Math.PI / 180;
  const y = Math.sin((b.lng - a.lng) * toR) * Math.cos(b.lat * toR);
  const x = Math.cos(a.lat * toR) * Math.sin(b.lat * toR) - Math.sin(a.lat * toR) * Math.cos(b.lat * toR) * Math.cos((b.lng - a.lng) * toR);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}
export const COMPASS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
export const compassOf = (deg) => COMPASS[Math.round(deg / 45) % 8];
export function fmtDist(m) {
  const ft = m * 3.28084;
  if (ft < 528) return `${Math.round(ft / 10) * 10} ft`;            // under ~0.1 mi: feet
  const mi = m / 1609.344;
  return mi < 10 ? `${mi.toFixed(1)} mi` : `${Math.round(mi)} mi`;
}
export function fmtAcc(m) { return m == null ? "" : m < 1609 ? `±${Math.round(m * 3.28084)} ft` : `±${(m / 1609.344).toFixed(1)} mi`; }

// Turns the people who are sharing into a map model:
// markers (you and them), bounds that fit them all, and a distance and direction from you to each person.
// sharers: [{ id, name, me, loc: { lat, lng, acc } }] (same shape as sharers() in app.js)
export function buildMapModel(sharers) {
  const markers = (sharers || [])
    .filter((s) => s && s.loc && Number.isFinite(s.loc.lat) && Number.isFinite(s.loc.lng))
    .map((s) => ({ id: s.id, name: s.name || "Someone", me: !!s.me, lat: s.loc.lat, lng: s.loc.lng, acc: s.loc.acc ?? null }));
  if (!markers.length) return { empty: true, markers: [], bounds: null, pairs: [] };
  const lats = markers.map((m) => m.lat), lngs = markers.map((m) => m.lng);
  let [minLat, maxLat, minLng, maxLng] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)];
  // one point (or points on a line) still needs a little room to show
  if (maxLat - minLat < 0.002) { minLat -= 0.001; maxLat += 0.001; }
  if (maxLng - minLng < 0.002) { minLng -= 0.001; maxLng += 0.001; }
  const me = markers.find((m) => m.me) || null;
  const pairs = me
    ? markers.filter((m) => !m.me).map((m) => ({
        id: m.id, name: m.name, meters: haversine(me, m), bearing: bearing(me, m), compass: compassOf(bearing(me, m)), acc: m.acc,
      }))
    : [];
  return { empty: false, markers, bounds: [[minLat, minLng], [maxLat, maxLng]], pairs };
}
