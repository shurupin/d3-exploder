/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/camelcase */
import React, { Component } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson';
import { exploder as myExportedExploder } from '../utils/d3-exploder';

export default class Exploder extends Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
    this.myExploder = myExportedExploder();
  }

  componentDidMount() {
    this.drawExploder(this.myExploder);
  }

  drawExploder = (myExploder) => {
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = 960 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    // let centered;
    let animation;

    const projection = d3.geoAlbersUsa().scale(width);

    const path = d3.geoPath().projection(projection);

    const svg = d3
      .select('#map')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    d3.json('https://raw.githubusercontent.com/bsouthga/d3-exploder/master/docs/us.json')
      .then(function (us) {
        const state_features = topojson.feature(us, us.objects.states).features;

        const feature_domain = [0, state_features.length - 1];

        // setup x
        const xScale = d3.scaleLinear().range([0, width]).domain(feature_domain); // value -> display
        const xAxis = d3.axisBottom().scale(xScale);

        // setup y
        const yScale = d3.scaleLinear().range([height, 0]).domain(feature_domain); // value -> display
        const yAxis = d3.axisLeft().scale(yScale);

        // x-axis
        const x_axis_g = svg
          .append('g')
          .attr('class', 'x axis')
          .attr('transform', `translate(0,${height})`)
          .call(xAxis)
          .style('opacity', 0);

        x_axis_g
          .append('text')
          .attr('class', 'label')
          .attr('x', width)
          .attr('y', -6)
          .style('text-anchor', 'end')
          .text('Random X variable');

        // y-axis
        const y_axis_g = svg.append('g').attr('class', 'y axis').call(yAxis).style('opacity', 0);

        y_axis_g
          .append('text')
          .attr('class', 'label')
          .attr('transform', 'rotate(-90)')
          .attr('y', 6)
          .attr('dy', '.71em')
          .style('text-anchor', 'end')
          .text('Random Y variable');

        const g = svg.append('g');

        // const scale = d3
        //   .scaleLinear()
        //   .domain(feature_domain)
        //   .range([0, Math.PI * 2]);

        // const paths_circle = [];

        const paths_rectangle = [];

        const states = g
          .append('g')
          .attr('id', 'states')
          .selectAll('path')
          .data(state_features)

          .enter()
          .append('path')
          .attr('d', function (state) {
            // draw states
            const path_map = path(state);

            // circles
            // const path_circle = circle(state);
            // paths_circle.push(path_circle);

            // transform to rectangles and place them
            const path_rectangle = rectangle(state);
            paths_rectangle.push(path_rectangle);

            return path_map;
          });

        const default_size = function (d, i) {
          return 40;
        };
        const exploder = myExploder.projection(projection); // .size(default_size)

        function addButton(text, callback) {
          d3.select('#buttons')
            .append('button')
            .text(text)
            .on('click', function () {
              // clear running animation
              animation = clearTimeout(animation);
              // hide axis
              x_axis_g.transition().duration(500).style('opacity', 0);
              y_axis_g.transition().duration(500).style('opacity', 0);
              // reset to default size
              exploder.size(default_size);
              callback.call(this);
            });
        }

        // --------------------------
        //
        // Scatter Plot
        //
        // --------------------------
        addButton('scatter', function (d, i) {
          // hide axis
          x_axis_g.transition().duration(500).style('opacity', 1);
          y_axis_g.transition().duration(500).style('opacity', 1);

          states
            .transition()
            .duration(500)
            .call(
              exploder.position(function (d, i) {
                const x = xScale(i) + (-0.5 + Math.random()) * 70;
                const y = yScale(i) + (-0.5 + Math.random()) * 70;
                return [x, y];
              }),
            );
        });

        /* addButton('static', function (d, i) {
          // hide axis
          x_axis_g.transition().duration(500).style('opacity', 1);
          y_axis_g.transition().duration(500).style('opacity', 1);

          states
            .transition()
            .duration(500)
            .call(
              exploder.position(function (d, i) {
                const x = xScale(i) + (-0.5 + Math.random()) * 70;
                const y = 200;
                return [x, y];
              }),
            )
            .duration(3000)
            .transition()
            .attr('d', function (d, i) {
              return paths_circle[i];
            });
        }); */

        // --------------------------
        //
        // realign map
        //
        // --------------------------
        addButton('reset', function () {
          states.transition().duration(500).attr('d', path).attr('transform', 'translate(0,0)');
        });

        // function circle(state) {
        //   // one departement can be made of several polygons.
        //   // I keep only the biggest polygon.

        //   const center = path.centroid(state);
        //   // const inscrits = 250000; /* departement.properties.Inscrits */
        //   // const scale2 = 50;
        //   // const radius = Math.sqrt(inscrits) / scale2;
        //   const radius = 15;
        //   const n =
        //     state.geometry.coordinates
        //       .map(function (coord) {
        //         return coord[0].length;
        //       })
        //       .reduce(function (a, b) {
        //         return a + b;
        //       }) - 1;
        //   let angle;
        //   const angleOffset = 0;
        //   let x0;
        //   let y0;
        //   let i = -1;
        //   const points = [];

        //   while (++i < n) {
        //     // do the math on the centered unit circle
        //     angle = angleOffset + (i * 2 * Math.PI) / n;
        //     x0 = Math.cos(angle);
        //     y0 = Math.sin(angle);

        //     // scale and translate
        //     x0 = x0 * radius + center[0];
        //     y0 = y0 * radius + center[1];
        //     points.push(`${x0} ${y0}`);
        //     // [`123 125`, `234 235`].join(' L ')
        //     // `123 125 L 234 235`
        //   }
        //   // create a path
        //   return `M ${points.join(' L ')} Z`;
        //   // `M 123 125 L 234 235 L 456 489 Z`
        // }

        // --------------------------
        //
        // rectangle map
        //
        // --------------------------
        addButton('rectangle', function (d, i) {
          // hide axis
          x_axis_g.transition().duration(500).style('opacity', 1);
          y_axis_g.transition().duration(500).style('opacity', 1);

          states
            .transition()
            .duration(500)
            // transit and place polygons along one line
            .call(
              exploder.position(function (d, i) {
                const x = xScale(i) + -0.5 * 70; // + Math.random()
                const y = 300; // alignment along the Y
                return [x, y];
              }),
            )
            .duration(3000)
            // .transition()
            .attr('d', function (d, i) {
              return paths_rectangle[i];
            });
        });

        function rectangle(state_polygon) {
          // cenroids of initial states polygons
          const centroid = path.centroid(state_polygon);

          // the bar height is calculated based on a quantitative value from the states properties
          // lust for now it's ID
          const bar_height = state_polygon.id;

          // the width is fixed for all the bars
          const bar_width = 15;

          //
          // const n =
          //   state_polygon.geometry.coordinates
          //     .map(function (coord) {
          //       return coord[0].length;
          //     })
          //     .reduce(function (a, b) {
          //       return a + b;
          //     }) - 1;

          // bar verticies
          const points = [];

          // bar_width is calculated along X, bar_height is along Y axes
          points.push(`${centroid[0] - bar_width} ${centroid[1] + bar_height}`);
          points.push(`${centroid[0] + bar_width} ${centroid[1] + bar_height}`);
          points.push(`${centroid[0] + bar_width} ${centroid[1] - bar_height}`);
          points.push(`${centroid[0] - bar_width} ${centroid[1] - bar_height}`);

          /*           while (++i < n) {
            // do the math on the centered unit circle
            angle = angleOffset + (i * 2 * Math.PI) / n;
            x0 = Math.cos(angle);
            y0 = Math.sin(angle);

            // scale and translate
            x0 = x0 * radius + center[0];
            y0 = y0 * radius + center[1];
            points.push(`${x0} ${y0}`);
            // [`123 125`, `234 235`].join(' L ')
            // `123 125 L 234 235`
          } */
          // create a path
          return `M ${points.join(' L ')} Z`;
          // `M 123 125 L 234 235 L 456 489 Z`
        }
      })
      .catch(function (error) {
        console.log('error d3 json = ', error);
      });
  };

  render() {
    return (
      <>
        <div id="buttons" />
        <div id="map" ref={this.mapRef} />
      </>
    );
  }
}
