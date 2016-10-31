import * as d3 from 'd3';

const util = {};

// This function converts margin absolute or relative (%) values with a specified width/height into
// a size object that has the following properties: size.top, size.left, size.height, size.width
// This function is used by many of the components and skins.

util.size = function (margin, width, height) {
  const size = {};
  size.width = width - util.measure(margin.left, width) - util.measure(margin.right, width);
  size.height = height - util.measure(margin.top, height) - util.measure(margin.bottom, height);
  size.top = util.measure(margin.top, height);
  size.left = util.measure(margin.left, width);
  return size;
};
// This function sets a scale based on the value being passed into it.
// It will default to a linear scale if the incoming value is not a string or a date
// This solves 80% of the use cases for setting up a scale, other use cases
// can be handled individually at the component
// or application level

util.getTypedScale = function (value) {
  let scale;
  if (typeof value === 'string') {
    scale = d3.scale.ordinal();
  } else if (value instanceof Date) {
    scale = d3.time.scale();
  } else {
    scale = d3.scale.linear();
  }
  return scale;
};

// This function sets a range based on min and max values, and
// uses range bands if the scale is an ordinal scale (assumed by string value
// in the scale domain -
// as class equality is not supported in javascript outside of using protoype
// chains (which we don't use.)

util.setRange = function (scale, min, max) {
  if (typeof (scale.domain()[0]) === 'string') {
    scale.rangeBands([min, max], 0);
  } else {
    scale.range([min, max]);
  }
};


// This function will see if we are using a relative (%) value against a given measure
// If we are it calculates the percentage value and returns that
// If we aren't it just returns the original m0 parameter
// This is primarily used by the util.size function.

util.measure = function (m0, m1) {
  if (typeof m0 === 'string' && m0.substr(m0.length - 1) === '%') {
    const r = Math.min(Number(m0.substr(0, m0.length - 1)), 100) / 100;
    return (Math.round(m1 * r));
  }
  return m0;
};


// This function generates a GUID
// All vizuly components use a GUID as an unique identifiers within the DOM

util.guid = function () {
  /* REAL GUID
   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
   var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
   return v.toString(16);
   });
   */
  //Simple ID that is unique enough for an DOM tree.
  return 'vzxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 || 0;
    const v = c === 'x' ? r : (r && (0x3 || 0x8));
    return v.toString(16);
  });
};

// This function will get a reference to the svg.defs element within a
// component (assumes only one SVG element)
// If no def's element is present it will create one

util.getDefs = function (viz) {
  let defs = viz.selection().selectAll('svg defs');
  if (defs[0].length < 1) {
    defs = viz.selection().select('svg').append('defs');
  }
  return defs;
};

util.createCSSKey = function (s) {
  const ss = String(s).replace(',', '_').replace(/[\s+,"+,\.,\(,\),"]/g, '');
  return `css${ss.toUpperCase()}`;
};
export default util;
