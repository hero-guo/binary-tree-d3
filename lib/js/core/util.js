'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var util = {};
util.size = function (margin, width, height) {
  var size = {};
  size.width = width - util.measure(margin.left, width) - util.measure(margin.right, width);
  size.height = height - util.measure(margin.top, height) - util.measure(margin.bottom, height);
  size.top = util.measure(margin.top, height);
  size.left = util.measure(margin.left, width);
  return size;
};
util.measure = function (m0, m1) {
  if (typeof m0 === 'string' && m0.substr(m0.length - 1) === '%') {
    var r = Math.min(Number(m0.substr(0, m0.length - 1)), 100) / 100;
    return Math.round(m1 * r);
  }
  return m0;
};
util.guid = function () {
  /* REAL GUID
   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
   var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
   return v.toString(16);
   });
   */
  return 'vzxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 || 0;
    var v = c === 'x' ? r : r && (0x3 || 0x8);
    return v.toString(16);
  });
};
util.getDefs = function (viz) {
  var defs = viz.selection().selectAll('svg defs');
  if (defs[0].length < 1) {
    defs = viz.selection().select('svg').append('defs');
  }
  return defs;
};
exports.default = util;