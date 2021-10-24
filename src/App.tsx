import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import * as d3 from "d3";
import { Particle } from "./util/Particle";
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
    4
  );

  p.forEach((p) => {
    newQuad.insert(p);
  });
  return newQuad;
}
let currId = 0;

const App = () => {
  const t = interval(() => {
    particles = rUtil.updateParticles(particles);
    quadTree = generateQuadTree(particles);
    let svg = d3.select("#view");
    rUtil.renderParticles(svg, particles);
    rUtil.renderQuadTree(svg, quadTree.getRenderingData());
  }, rUtil.REFRESH_RATE);

  useEffect(() => {
    const svg = d3.select("#view");
    svg.on("click", function ($event) {
      const coords = d3.pointer($event);
      const newParticle: Particle = {
        id: currId,
        x: coords[0], // Takes the pixel number to convert to number
        y: coords[1],
        dx: 5,
        dy: 1,
        c: "red",
        r: rUtil.PARTICLE_WIDTH,
      };
      currId++;
      particles.push(newParticle);
      quadTree = generateQuadTree(particles);
    });
  });

  return (
    <div className="app-body">
      <div className="view-wrapper">
        <div>
          <p>Particle count: {particles.length}</p>
        </div>
        <svg id="view"></svg>
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
