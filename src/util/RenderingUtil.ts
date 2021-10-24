import { useContext } from "react";
import { getParticleBounds, Particle, particlesHaveCollided } from "./Particle";
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
  // svg
  //   .selectAll("rect")
  //   .data(rect)
  //   .join("rect")
  //   .attr("x", (r) => r.x - r.dimX)
  //   .attr("y", (r) => r.y - r.dimY)
  //   .attr("width", (r) => r.dimX * 2)
  //   .attr("height", (r) => r.dimY * 2)
  //   .attr("fill", "transparent")
  //   .attr("stroke", "black");
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
