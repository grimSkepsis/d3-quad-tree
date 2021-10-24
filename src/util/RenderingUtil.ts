import { reduce } from "d3-array";
import {
  getParticleBounds,
  Particle,
  particlesHaveCollided,
  getParticleDistance,
} from "./Particle";
import { Rectangle, QuadTree } from "./QuadTree";

export const VIEW_PORT_WIDTH = 800;
export const VIEW_PORT_HEIGHT = 500;

export const PARTICLE_WIDTH = 10;

export const REFRESH_RATE = 20;

export function renderScene(
  canvas: d3.Selection<HTMLCanvasElement, unknown, HTMLElement, any>,
  part: Particle[],
  quad: QuadTree
): void {
  const context = canvas.node()?.getContext("2d");
  if (context) {
    context.fillStyle = "#fff";
    context.rect(
      0,
      0,
      Number(canvas.attr("width")),
      Number(canvas.attr("height"))
    );
    context.fill();
    renderParticles(context, part);
    renderQuadTree(context, quad.getRenderingData());
  }
}

export function renderParticles(
  context: CanvasRenderingContext2D,
  part: Particle[]
): void {
  part.forEach((p) => {
    context.beginPath();
    context.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
    context.fillStyle = p.c;
    context.fill();
    context.closePath();
  });
}

export function renderQuadTree(
  context: CanvasRenderingContext2D,
  rect: Rectangle[]
): void {
  rect.forEach((r) => {
    context.beginPath();
    context.rect(r.x - r.dimX, r.y - r.dimY, r.dimX * 2, r.dimY * 2);
    context.strokeStyle = "black";
    context.stroke();
    context.closePath();
  });
}

function getNextX(p: Particle): { x: number; dx: number } {
  const returnVal = { x: p.x + p.dx, dx: p.dx };
  if (p.dx < 0 && p.x + p.dx - p.r < 0) {
    returnVal.x = p.r;
    returnVal.dx = -returnVal.dx;
  } else if (p.dx > 0 && p.x + p.dx + p.r > VIEW_PORT_WIDTH) {
    returnVal.x = VIEW_PORT_WIDTH - p.r;
    returnVal.dx = -returnVal.dx;
  }
  return returnVal;
}

function getNextY(p: Particle): { y: number; dy: number } {
  const returnVal = { y: p.y + p.dy, dy: p.dy };
  if (p.dy < 0 && p.y + p.dy - p.r < 0) {
    returnVal.y = p.r;
    returnVal.dy = -returnVal.dy;
  } else if (p.dy > 0 && p.y + p.dy + p.r > VIEW_PORT_HEIGHT) {
    returnVal.y = VIEW_PORT_HEIGHT - p.r;
    returnVal.dy = -returnVal.dy;
  }
  return returnVal;
}

function checkParticleCollisions(p: Particle, quad: QuadTree): Particle {
  const collidedParticles: Particle[] = quad.query(getParticleBounds(p));
  let hasCollided = false;
  for (let i = 0; i < collidedParticles.length; i++) {
    const colP = collidedParticles[i];
    if (colP.id !== p.id && particlesHaveCollided(p, colP)) {
      hasCollided = true;
      collideParticles(p, colP);
    }
  }

  return {
    ...p,
    c: hasCollided ? "blue" : "red",
  };
}

/**
 * Applies collision effects to 2 particles
 * @param p1
 * @param p2
 * @returns
 */
function collideParticles(p1: Particle, p2: Particle): void {
  //logic taken from https://spicyyoghurt.com/tutorials/html5-javascript-game-development/collision-detection-physics
  const vCollision = { x: p1.x - p2.x, y: p1.y - p2.y };
  const dist = getParticleDistance(p1, p2);
  const vCollisionNorm = { x: vCollision.x / dist, y: vCollision.y / dist };
  const vRelativeVelocity = { x: p1.dx - p2.dx, y: p1.dy - p2.dy };
  const speed =
    vRelativeVelocity.x * vCollisionNorm.x +
    vRelativeVelocity.y * vCollisionNorm.y;

  if (speed > 0) return;
  p1.dx -= speed * vCollisionNorm.x;
  p1.dy -= speed * vCollisionNorm.y;
  p2.dx += speed * vCollisionNorm.x;
  p2.dy += speed * vCollisionNorm.y;
}

export function updateParticles(
  quad: QuadTree,
  particles: Particle[]
): Particle[] {
  const updatedParticles = particles

    .map((p) => checkParticleCollisions(p, quad))
    .map((p) => {
      return {
        ...p,
        ...getNextX(p),
        ...getNextY(p),
      };
    });

  return updatedParticles;
}
