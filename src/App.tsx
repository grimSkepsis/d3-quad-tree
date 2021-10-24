import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import * as d3 from "d3";
import { Particle, getParticleBounds } from "./util/Particle";
import * as rUtil from "./util/RenderingUtil";
import { interval } from "d3-timer";
import { QuadTree, Rectangle } from "./util/QuadTree";

let particles: Particle[] = [];
let quadTree: QuadTree;

function generateQuadTree(p: Particle[]): QuadTree {
  let newQuad = new QuadTree(
    new Rectangle(
      rUtil.VIEW_PORT_WIDTH / 2,
      rUtil.VIEW_PORT_HEIGHT / 2,
      rUtil.VIEW_PORT_WIDTH / 2,
      rUtil.VIEW_PORT_HEIGHT / 2
    ),
    2
  );

  p.forEach((p) => {
    newQuad.insert(p);
  });
  return newQuad;
}
let currId = 0;
const t = interval(() => {
  quadTree = generateQuadTree(particles);
  particles = rUtil.updateParticles(quadTree, particles);

  let svg = d3.select("#view");
  rUtil.renderParticles(svg, particles);
  rUtil.renderQuadTree(svg, quadTree.getRenderingData());
}, rUtil.REFRESH_RATE);

const App = () => {
  const [particleCount, setParticleCount] = useState(0);

  useEffect(() => {
    const svg = d3.select("#view");
    svg.on("click", function ($event) {
      const [x, y] = d3.pointer($event);
      const newParticle: Particle = {
        id: currId,
        x: x, // Takes the pixel number to convert to number
        y: y,
        dx: 5,
        dy: 1,
        c: "red",
        r: rUtil.PARTICLE_WIDTH,
      };
      currId++;
      setParticleCount(particleCount + 1);
      particles.push(newParticle);
      quadTree = generateQuadTree(particles);
      console.log(quadTree.query(getParticleBounds(newParticle)));
    });
  });

  return (
    <div className="app-body">
      <div className="view-wrapper">
        <div>
          <p>Particle count: {particleCount}</p>
        </div>
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
