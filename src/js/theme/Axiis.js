const Axiis = function (v, fontSize) {
  const viz = v;
  return {
    name: 'Axiis',
    label_color: '#000',
    link_colors: [
      '#bd0026', '#fecc5c', '#fd8d3c', '#f03b20', '#B02D5D',
      '#9B2C67', '#982B9A', '#692DA7', '#5725AA', '#4823AF',
      '#d7b5d8', '#dd1c77', '#5A0C7A', '#5A0C7A'
    ],
    link_stroke: d => d.target.vz_link_color,
    link_stroke_opacity(d) {
      return viz.value()(d.target) <= 0 ? 0.15 : 0.35;
    },
    node_fill: d => d.vz_link_color,
    node_fill_opacity(d) {
      return viz.value()(d) <= 0 ? 0.15 : 0.4;
    },
    node_stroke: d => d.vz_link_color,
    node_stroke_opacity: () => 0.6,
    text_fill_opacity(d) {
      return viz.value()(d) <= 0 ? 0.35 : 1;
    },
    font_size() {
      return `${fontSize}px`;
    }
  };
};
export default Axiis;
