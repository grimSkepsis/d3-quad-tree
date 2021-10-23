import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import * as d3 from "d3";
import { Particle } from "./util/Particle";
import * as rUtil from "./util/RenderingUtil";
import { interval } from "d3-timer";

let particles: Particle[] = [];
let currId: number = 0;

const App = () => {
  const t = interval(() => {
    particles = rUtil.updateParticles(particles);
    let svg = d3.select("#view");
    rUtil.renderParticles(svg, particles);
  }, rUtil.REFRESH_RATE);

  useEffect(() => {
    let svg = d3.select("#view");
    svg.on("click", function ($event) {
      let coords = d3.pointer($event);
      let newParticle: Particle = {
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
    });
  });

  useEffect(() => {});

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
