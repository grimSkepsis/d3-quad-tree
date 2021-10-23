import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import * as d3 from "d3";

const App = () => {
  useEffect(() => {
    d3.select("#view").append("span").text("Hello, world!");
  });

  return (
    <div>
      <div id="view"></div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
