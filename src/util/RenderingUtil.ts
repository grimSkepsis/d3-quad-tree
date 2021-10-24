import { getParticleBounds, Particle, particlesHaveCollided } from "./Particle";
import { Rectangle, QuadTree } from "./QuadTree";

export const VIEW_PORT_WIDTH = 800;
export const VIEW_PORT_HEIGHT = 500;

export const PARTICLE_WIDTH = 10;

export const REFRESH_RATE = 20;

export function renderParticles(
  svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
  part: Particle[]
): void {
  svg
    .selectAll("circle")
    .data(part, (p) => p.id)
    .join("circle")
    .attr("r", (p) => p.r)
    .attr("fill", (p) => p.c)
    .transition()
    .attr("cx", (p) => p.x)
    .attr("cy", (p) => p.y)
    .duration(REFRESH_RATE);
}

export function renderQuadTree(
  svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
  rect: Rectangle[]
): void {
  svg
    .selectAll("rect")
    .data(rect)
    .join("rect")
    .attr("x", (r) => r.x - r.dimX)
    .attr("y", (r) => r.y - r.dimY)
    .attr("width", (r) => r.dimX * 2)
    .attr("height", (r) => r.dimY * 2)
    .attr("fill", "transparent")
    .attr("stroke", "black");
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
  let collidedParticles: Particle[] = quad.query(getParticleBounds(p));
  let hasCollided: boolean = false;

  for (let i = 0; i < collidedParticles.length; i++) {
    const colP = collidedParticles[i];
    if (colP.id !== p.id && particlesHaveCollided(p, colP)) {
      hasCollided = true;
      break;
    }
  }

  if (hasCollided) {
    return {
      ...p,
      dx: -p.dx,
      dy: -p.dy,
    };
  }
  return p;
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
