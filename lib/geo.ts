const EARTH_RADIUS = 6_371_000;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function distance(a: [number, number], b: [number, number]): number {
  const [lat1, lng1] = a;
  const [lat2, lng2] = b;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      sinDLng *
      sinDLng;
  return 2 * EARTH_RADIUS * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function polylineLength(coords: [number, number][]): number {
  let len = 0;
  for (let i = 1; i < coords.length; i++) {
    len += distance(coords[i - 1], coords[i]);
  }
  return len;
}

export function interpolate(
  coords: [number, number][],
  fraction: number
): [number, number] {
  if (coords.length === 0) return [0, 0];
  if (coords.length === 1) return coords[0];

  const total = polylineLength(coords);
  const target = fraction * total;
  let traveled = 0;

  for (let i = 1; i < coords.length; i++) {
    const segLen = distance(coords[i - 1], coords[i]);
    if (traveled + segLen >= target) {
      const t = (target - traveled) / segLen;
      return [
        coords[i - 1][0] + t * (coords[i][0] - coords[i - 1][0]),
        coords[i - 1][1] + t * (coords[i][1] - coords[i - 1][1]),
      ];
    }
    traveled += segLen;
  }
  return coords[coords.length - 1];
}

function pointToSegmentDist(
  p: [number, number],
  a: [number, number],
  b: [number, number]
): number {
  const segLen = distance(a, b);
  if (segLen === 0) return distance(p, a);

  const midLat = ((a[0] + b[0]) / 2) * (Math.PI / 180);
  const latToM = 111_320;
  const lngToM = 111_320 * Math.cos(midLat);

  const ax = a[0] * latToM, ay = a[1] * lngToM;
  const bx = b[0] * latToM, by = b[1] * lngToM;
  const px = p[0] * latToM, py = p[1] * lngToM;

  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy;

  let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  const projX = ax + t * dx;
  const projY = ay + t * dy;

  return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
}

export function minDistanceToPolyline(
  point: [number, number],
  coords: [number, number][]
): number {
  let min = Infinity;
  for (let i = 1; i < coords.length; i++) {
    const d = pointToSegmentDist(point, coords[i - 1], coords[i]);
    if (d < min) min = d;
  }
  return min;
}

export function pointInPolygon(
  point: [number, number],
  polygon: [number, number][]
): boolean {
  const [lat, lng] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [lati, lngi] = polygon[i];
    const [latj, lngj] = polygon[j];
    if (
      lngi > lng !== lngj > lng &&
      lat < ((latj - lati) * (lng - lngi)) / (lngj - lngi) + lati
    ) {
      inside = !inside;
    }
  }
  return inside;
}

export function routeIntersectsGeofence(
  coords: [number, number][],
  polygon: [number, number][]
): boolean {
  for (const point of coords) {
    if (pointInPolygon(point, polygon)) return true;
  }
  for (let i = 1; i < coords.length; i++) {
    for (let j = 0; j < polygon.length; j++) {
      const k = (j + 1) % polygon.length;
      if (
        segmentsIntersect(
          coords[i - 1], coords[i],
          polygon[j], polygon[k]
        )
      ) {
        return true;
      }
    }
  }
  return false;
}

function segmentsIntersect(
  a: [number, number], b: [number, number],
  c: [number, number], d: [number, number]
): boolean {
  const [ax, ay] = a; const [bx, by] = b;
  const [cx, cy] = c; const [dx, dy] = d;

  const det = (bx - ax) * (dy - cy) - (by - ay) * (dx - cx);
  if (Math.abs(det) < 1e-12) return false;

  const t = ((cx - ax) * (dy - cy) - (cy - ay) * (dx - cx)) / det;
  const u = ((cx - ax) * (by - ay) - (cy - ay) * (bx - ax)) / det;

  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
}
