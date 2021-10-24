import { Rectangle } from "./QuadTree";

export type Particle = {
  id: number;
  x: number;
  y: number;
  r: number;
  dx: number;
  dy: number;
  c: string;
};

export function getParticleBounds(p: Particle): Rectangle {
  return new Rectangle(p.x, p.y, p.r, p.r);
}

export function particlesHaveCollided(p1: Particle, p2: Particle) {
  const INTERSECTION_DIST = p1.r + p2.r;
  const ACTUAL_DIST = Math.sqrt(
    Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)
  );
  return ACTUAL_DIST <= INTERSECTION_DIST;
}
