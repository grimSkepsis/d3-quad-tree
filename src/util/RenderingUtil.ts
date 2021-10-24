import { Particle } from "./Particle";

export const VIEW_PORT_WIDTH: number = 800;
export const VIEW_PORT_HEIGHT: number = 500;

export const PARTICLE_WIDTH: number = 10;

export const REFRESH_RATE: number = 20;

export function renderParticles(
  svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>,
  part: Particle[]
) {
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

function getNextX(p: Particle): { x: number; dx: number } {
  let returnVal = { x: p.x + p.dx, dx: p.dx };
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
  let returnVal = { y: p.y + p.dy, dy: p.dy };
  if (p.dy < 0 && p.y + p.dy - p.r < 0) {
    returnVal.y = p.r;
    returnVal.dy = -returnVal.dy;
  } else if (p.dy > 0 && p.y + p.dy + p.r > VIEW_PORT_HEIGHT) {
    returnVal.y = VIEW_PORT_HEIGHT - p.r;
    returnVal.dy = -returnVal.dy;
  }
  return returnVal;
}

export function updateParticles(particles: Particle[]): Particle[] {
  let updatedParticles = particles.map((p) => {
    return {
      ...p,
      ...getNextX(p),
      ...getNextY(p),
    };
  });

  return updatedParticles;
}
