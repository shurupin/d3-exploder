/* eslint-disable no-use-before-define */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable import/prefer-default-export */
import * as d3 from 'd3';

const methods = ['size', 'position', 'projection'];

function error(message) {
  throw new Error(`d3-exploder: ${message}`);
}

export function exploder() {
  const path = d3.geoPath();

  // create getters / setters
  const state = {};
  methods.forEach(function (option) {
    explode[option] = function (value) {
      if (!arguments.length) return state[option];
      if (!(value instanceof Function)) error(`${option} needs to be a function.`);
      state[option] = value;
      return explode;
    };
  });

  function explode(selection) {
    // check for necessary parameters
    methods.forEach(function (option) {
      if (!state[option]) error(`${option} not provided to exploder.`);
    });

    // local references to configuration
    const { projection } = state;
    const { size } = state;
    const { position } = state;
    const scale = projection.scale();
    const cache = {};

    // update projection of path function
    path.projection(projection);

    // the order of the attribute changes matters!
    // setting 'd' caches the new scale which is used
    // in the transform change
    selection
      .attr('d', function (d, i) {
        // compute size based on user functions
        const sz = size(d, i);

        // calculate new scale for projection based on desired
        // pixel size of feature
        projection.scale(scale);

        const bounds = path.bounds(d);
        const w = bounds[1][0] - bounds[0][0];
        const h = bounds[1][1] - bounds[0][1];
        // eslint-disable-next-line no-multi-assign
        const sc = (cache[i] = Math.min(sz / h, sz / w));

        // scale projection to desired size
        projection.scale(scale * sc);

        // return scaled path
        return path(d);
      })
      .attr('transform', function (d, i) {
        // update projection with cached scale
        projection.scale(scale * cache[i]);

        const center = path.centroid(d);
        const desired = position(d, i);
        const translate = [desired[0] - center[0], desired[1] - center[1]];

        // return desired coordinates offset by centroid
        return `translate(${translate})`;
      });

    // reset scale for projection
    projection.scale(scale);
  }

  // return configurable exploder function
  return explode;
}
