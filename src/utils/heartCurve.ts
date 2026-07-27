import * as THREE from "three";

export type HeartCurve = {
  /** Ordered points forming a closed heart-shaped loop (z = 0). */
  points: THREE.Vector3[];
  /** The same points as flat [x, y, z] tuples, for line geometries. */
  linePoints: [number, number, number][];
  /**
   * Sample a position on the heart outline.
   * @param progress value in [0, 1); wraps around the closed loop.
   * @param target optional Vector3 to write into (avoids allocations in loops).
   */
  sample: (progress: number, target?: THREE.Vector3) => THREE.Vector3;
};

/**
 * Sample the classic parametric heart:
 *
 *   x = 16 · sin³(t)
 *   y = 13·cos(t) − 5·cos(2t) − 2·cos(3t) − cos(4t)
 */
function rawHeartPoints(segments: number): THREE.Vector2[] {
  const raw: THREE.Vector2[] = [];
  for (let i = 0; i < segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t);
    raw.push(new THREE.Vector2(x, y));
  }
  return raw;
}

function measure(points: THREE.Vector2[]) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  return { minX, maxX, minY, maxY };
}

/**
 * Width ÷ height of the heart outline. Scale-independent, so it can be used to
 * work out a fitting `size` before the curve itself is built. The heart is
 * wider than it is tall, which makes its width the axis `size` measures.
 */
export const HEART_ASPECT = (() => {
  const b = measure(rawHeartPoints(256));
  return (b.maxX - b.minX) / (b.maxY - b.minY);
})();

/**
 * Largest heart `size` that still fits the viewport at a given camera distance.
 *
 * A perspective camera's `fov` is vertical, so a tall, narrow phone screen shows
 * far fewer world units across than a desktop one — a fixed size overflows the
 * sides. `margin` leaves room for the labels riding on the outline.
 */
export function fitHeartSize(
  viewportAspect: number,
  cameraZ: number,
  fovDeg: number,
  margin = 0.8,
  min = 5,
  max = 11
): number {
  const visibleHeight = 2 * cameraZ * Math.tan((fovDeg * Math.PI) / 360);
  const visibleWidth = visibleHeight * viewportAspect;

  // `size` is the heart's width; its height is therefore size / HEART_ASPECT.
  const byWidth = visibleWidth * margin;
  const byHeight = visibleHeight * margin * HEART_ASPECT;

  return Math.min(max, Math.max(min, Math.min(byWidth, byHeight)));
}

/**
 * Build a reusable heart-shaped curve.
 *
 * The raw coordinates are centered and uniformly scaled so the whole heart
 * fits inside `size` world units (measured on the longer axis), keeping it
 * comfortably within the camera view.
 */
export function buildHeartCurve(size = 11, segments = 256): HeartCurve {
  const raw = rawHeartPoints(segments);

  const { minX, maxX, minY, maxY } = measure(raw);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;
  const span = Math.max(maxX - minX, maxY - minY);
  const scale = size / span;

  const points = raw.map(
    (p) =>
      new THREE.Vector3((p.x - centerX) * scale, (p.y - centerY) * scale, 0)
  );

  const linePoints = points.map(
    (p) => [p.x, p.y, p.z] as [number, number, number]
  );

  const sample = (progress: number, target = new THREE.Vector3()) => {
    // Normalize progress into [0, 1).
    const p = ((progress % 1) + 1) % 1;
    const scaled = p * points.length;
    const i = Math.floor(scaled);
    const frac = scaled - i;
    const a = points[i % points.length];
    const b = points[(i + 1) % points.length];
    return target.set(
      a.x + (b.x - a.x) * frac,
      a.y + (b.y - a.y) * frac,
      a.z + (b.z - a.z) * frac
    );
  };

  return { points, linePoints, sample };
}
