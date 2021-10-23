import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import * as d3 from "d3";
import { Particle } from "./util/Particle";
import * as rUtil from "./util/RenderingUtil";

const App = () => {
  const [currId, setCurrId] = useState(1);
  const [particles, setParticles] = useState<Particle[]>([
    {
      id: 0,
      x: 50,
      y: 50,
      dx: 2,
      dy: 2,
      r: rUtil.PARTICLE_WIDTH,
      c: "red",
    },
  ]);

  useEffect(() => {
    let svg = d3.select("#view");
    svg
      .selectAll("circle")
      .data(particles)
      .enter()
      .append("circle")
      .attr("cx", (p) => p.x)
      .attr("cy", (p) => p.y)
      .attr("r", (p) => p.r)
      .attr("fill", (p) => p.c);
    svg.on(
      "click",
      function ($event) {
        let coords = d3.pointer($event);
        let newParticle: Particle = {
          id: currId,
          x: coords[0], // Takes the pixel number to convert to number
          y: coords[1],
          dx: 0,
          dy: 0,
          c: "red",
          r: rUtil.PARTICLE_WIDTH,
        };
        setParticles([...particles, newParticle]);
        setCurrId(currId + 1);
      },
      [particles]
    );
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
