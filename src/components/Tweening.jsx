/* eslint-disable class-methods-use-this */
import React, { Component } from 'react';
import * as d3 from 'd3';

import * as data from '../data/california.json';

export default class Tweening extends Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }

  componentDidMount() {
    this.drawTweening();
  }

  drawTweening() {
    const width = 960;
    const height = 500;

    const projection = d3.geoAlbersUsa().scale(1200);

    const svg = d3
      .select(this.myRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const coordinates0 = data.coordinates[0].map(projection);
    const coordinates1 = circle(coordinates0);
    const path = svg.append('path');
    const d0 = `M${coordinates0.join('L')}Z`;
    const d1 = `M${coordinates1.join('L')}Z`;

    loop();

    function loop() {
      path
        .attr('d', d0)
        .transition()
        .duration(5000)
        .attr('d', d1)
        .transition()
        .delay(5000)
        .attr('d', d0)
        .on('end', loop);
    }

    function circle(coordinates) {
      const circle = [];
      let length = 0;
      const lengths = [length];
      // const polygon = d3.geom.polygonArea(coordinates);
      let p0 = coordinates[0];
      let p1;
      let x;
      let y;
      var i = 0;
      const n = coordinates.length;

      // Compute the distances of each coordinate.
      while (++i < n) {
        p1 = coordinates[i];
        x = p1[0] - p0[0];
        y = p1[1] - p0[1];
        lengths.push((length += Math.sqrt(x * x + y * y)));
        p0 = p1;
      }

      function area(polygon) {
        let i = -1;
        const n = polygon.length;
        let a;
        let b = polygon[n - 1];
        let area3 = 0;
        while (++i < n) {
          a = b;
          b = polygon[i];
          area3 += a[1] * b[0] - a[0] * b[1];
        }
        return area3 * 0.5;
      }

      function centroid(polygon, k) {
        let i = -1;
        const n = polygon.length;
        let x = 0;
        let y = 0;
        let a;
        let b = polygon[n - 1];
        let c;
        if (!arguments.length) k = -1 / (6 * area(polygon));
        while (++i < n) {
          a = b;
          b = polygon[i];
          c = a[0] * b[1] - b[0] * a[1];
          x += (a[0] + b[0]) * c;
          y += (a[1] + b[1]) * c;
        }
        return [x * k, y * k];
      }

      const area2 = area(coordinates);
      const radius = Math.sqrt(Math.abs(area2) / Math.PI);
      const centroid2 = centroid(coordinates, -1 / (6 * area2));
      const angleOffset = -Math.PI / 2; // TODO compute automatically
      let angle;
      var i = -1;
      const k = (2 * Math.PI) / lengths[lengths.length - 1];

      // Compute points along the circle’s circumference at equivalent distances.
      while (++i < n) {
        angle = angleOffset + lengths[i] * k;
        circle.push([
          centroid2[0] + radius * Math.cos(angle),
          centroid2[1] + radius * Math.sin(angle),
        ]);
      }

      return circle;
    }
  }

  render() {
    return <div id="tweening" ref={this.myRef} />;
  }
}
