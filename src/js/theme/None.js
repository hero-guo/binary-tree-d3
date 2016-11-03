const None = function () {
  return {
    name: 'None',                          // Skin Name
    label_color: null,                    // Color of the center label
    link_colors: [
      '#bd0026', '#fecc5c', '#fd8d3c', '#f03b20', '#B02D5D',
      '#9B2C67', '#982B9A', '#692DA7', '#5725AA', '#4823AF',
      '#d7b5d8', '#dd1c77', '#5A0C7A', '#5A0C7A'
    ],
    link_stroke() {
      return null;
    },
    link_stroke_opacity() {
      return null;
    },
    node_fill() {
      return null;
    },
    node_fill_opacity() {
      return null;
    },
    node_stroke() {
      return null;
    },
    node_stroke_opacity() {
      return null;
    },
    text_fill_opacity() {
      return null;
    },
    font_size() {
      return null;
    }
  };
};
export default None;
