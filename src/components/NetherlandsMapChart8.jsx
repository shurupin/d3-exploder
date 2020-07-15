import React, { Component } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson';
import { exploder as myExportedExploder } from '../utils/d3-exploder';

export default class NetherlandsMapChart8 extends Component {
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
    let centered;
    let animation;

    const projection = d3
      .geoAlbers()
      .center([2.2, 52.1])
      .rotate([-4.668, 0])
      // .parallels([51.74, 49.34])
      .translate([width / 2, height / 2])
      .scale(width * 30);

    const path = d3.geoPath().projection(projection);

    const svg = d3
      .select('#netherlands-map-chart-8')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    d3.json(
      'https://raw.githubusercontent.com/deldersveld/topojson/master/countries/netherlands/nl-gemeentegrenzen-2016.json',
    )
      .then(function (nl) {
        const state_features = topojson.feature(nl, nl.objects.Gemeentegrenzen).features;

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

        const scale = d3
          .scaleLinear()
          .domain(feature_domain)
          .range([0, Math.PI * 2]);

        const paths_circle = [];
        const states = g
          .append('g')
          .attr('id', 'states')
          .selectAll('path')
          .data(
            state_features.filter(function (d) {
              return (
                d.properties.GM_NAAM == 'Losser' ||
                d.properties.GM_NAAM == 'Hengelo (O)' ||
                d.properties.GM_NAAM == 'Haaksbergen' ||
                d.properties.GM_NAAM == 'Enschede' ||
                d.properties.GM_NAAM == 'Dinkelland' ||
                d.properties.GM_NAAM == 'Tubbergen' ||
                d.properties.GM_NAAM == 'Oldenzaal' ||
                d.properties.GM_NAAM == 'Borne'
              );
            }),
          )
          .enter()
          .append('path')
          .attr('d', function (departement) {
            const path_map = path(departement);
            const path_circle = bar_chart_circle(departement);
            paths_circle.push(path_circle);
            return path_map;
          });

        const default_size = function (d, i) {
          return 40;
        };
        const exploder = myExploder.projection(projection).size(default_size);

        function addButton(text, callback) {
          d3.select('#buttons-netherlands-map-chart-8')
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
        // randomly ordered grid
        //
        // --------------------------
        addButton('random grid', function () {
          const rand = d3.shuffle(d3.range(state_features.length));
          states
            .transition()
            .duration(500)
            .call(
              exploder.position(function (d, index) {
                const i = rand[index];
                const px = Math.max(0, width - 9 * 60) / 2;
                return [px + (i % 10) * 60, 70 + Math.floor(i / 10) * 60];
              }),
            );
        });

        // --------------------------
        //
        // Circle Plot
        //
        // --------------------------
        function circle(d, i) {
          const t = scale(i);
          const r = (height / 2) * 0.8;
          const x = width / 2 + r * Math.cos(t);
          const y = height / 2 + r * Math.sin(t);
          return [x, y];
        }
        addButton('circle', function (d, i) {
          states.transition().duration(500).call(exploder.position(circle));
        });

        // --------------------------
        //
        // Figure 8 plot
        //
        // --------------------------
        function figure8(d, i) {
          const t = scale(i);
          const r = (height / 2) * 0.8;
          var d = 1 + Math.pow(Math.sin(t), 2);
          const x = width / 2 + (r * Math.cos(t)) / d;
          const y = height / 2 + (r * Math.sin(t) * Math.cos(t)) / d;
          return [x, y];
        }
        addButton('figure 8 animated', function () {
          let advance = 1;
          function tick() {
            states
              .transition()
              .duration(500)
              .call(
                exploder.position(function (d, i) {
                  return figure8(d, i + advance++);
                }),
              );
          }
          animation = setInterval(tick, 550);
          tick();
        });

        // --------------------------
        //
        // spiral Plot
        //
        // --------------------------
        const spiral_scale = d3.scaleLinear().domain(feature_domain).range([0, 50000]);
        const size_scale = d3.scaleLinear().domain(feature_domain).range([10, 100]);

        function spiral(d, i) {
          const t = spiral_scale(i);
          const x = width / 2 + Math.pow(t, 1 / 2) * Math.cos(t);
          const y = height / 2 + Math.pow(t, 1 / 2) * Math.sin(t);
          return [x, y];
        }
        addButton('spiral', function (d, i) {
          states
            .transition()
            .duration(500)
            .call(
              exploder.position(spiral).size(function (d, i) {
                return size_scale(i);
              }),
            );
        });

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

        addButton('static', function (d, i) {
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
        });

        // --------------------------
        //
        // realign map
        //
        // --------------------------
        addButton('reset', function () {
          states.transition().duration(500).attr('d', path).attr('transform', 'translate(0,0)');
        });

        function bar_chart_circle(departement) {
          // one departement can be made of several polygons.
          // I keep only the biggest polygon.

          const center = path.centroid(departement);
          // const inscrits = 250000; /* departement.properties.Inscrits */
          // const scale2 = 50;
          // const radius = Math.sqrt(inscrits) / scale2;
          const radius = 15;
          const n =
            departement.geometry.coordinates
              .map(function (coord) {
                return coord[0].length;
              })
              .reduce(function (a, b) {
                return a + b;
              }) - 1;
          let angle;
          const angleOffset = 0;
          let x0;
          let y0;
          let i = -1;
          const points = [];

          while (++i < n) {
            // do the math on the centered unit circle
            angle = angleOffset + (i * 2 * Math.PI) / n;
            x0 = Math.cos(angle);
            y0 = Math.sin(angle);

            // scale and translate
            x0 = x0 * radius + center[0];
            y0 = y0 * radius + center[1];
            points.push(`${x0} ${y0}`);
          }
          // create a path
          return `M ${points.join(' L ')} Z`;
        }
      })
      .catch(function (error) {
        console.log('error d3 json = ', error);
      });
  };

  render() {
    return (
      <>
        <div id="buttons-netherlands-map-chart-8" />
        <div id="netherlands-map-chart-8" ref={this.mapRef} />
      </>
    );
  }
}
