'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Axiis = function Axiis(v, fontSize) {
  var viz = v;
  return {
    name: 'Axiis',
    label_color: '#000',
    link_colors: ['#bd0026', '#fecc5c', '#fd8d3c', '#f03b20', '#B02D5D', '#9B2C67', '#982B9A', '#692DA7', '#5725AA', '#4823AF', '#d7b5d8', '#dd1c77', '#5A0C7A', '#5A0C7A'],
    link_stroke: function link_stroke(d) {
      return d.target.vz_link_color;
    },
    link_stroke_opacity: function link_stroke_opacity(d) {
      return viz.value()(d.target) <= 0 ? 0.15 : 0.35;
    },

    node_fill: function node_fill(d) {
      return d.vz_link_color;
    },
    node_fill_opacity: function node_fill_opacity(d) {
      return viz.value()(d) <= 0 ? 0.15 : 0.4;
    },

    node_stroke: function node_stroke(d) {
      return d.vz_link_color;
    },
    node_stroke_opacity: function node_stroke_opacity() {
      return 0.6;
    },
    text_fill_opacity: function text_fill_opacity(d) {
      return viz.value()(d) <= 0 ? 0.35 : 1;
    },
    font_size: function font_size() {
      return fontSize + 'px';
    }
  };
};
exports.default = Axiis;