import config from './theme';

const tree = function (v) {
  // This is the **viz** we will be styling.
  let viz = v;
  const fontSize = Math.max(8, Math.round(viz.width() / 75));
  const $skins = {
    Axiis: {
      name: 'Axiis',                          // Skin Name
      label_color: '#333',                    // Color of the center label
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
    },
    None: {
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
    }
  };
  let skin = $skins[config.WEIGHTED_TREE_AXIIS];
  let skinDirty = true;
  let dataDirty = true;
  function applyTheme() {
    if (!skin) return;
    const selection = viz.selection();
    selection.selectAll('.vz-weighted_tree-node circle')
      .style('stroke', d => skin.node_stroke(d))
      .style('stroke-opacity', d => skin.node_stroke_opacity(d))
      .style('fill', d => skin.node_fill(d))
      .style('fill-opacity', d => skin.node_fill_opacity(d));

    selection.selectAll('.vz-weighted_tree-node text')
      .style('font-size', skin.font_size())
      .style('fill', skin.label_color)
      .style('fill-opacity', d => skin.text_fill_opacity(d));

    selection.selectAll('.vz-weighted_tree-link')
      .style('stroke', d => skin.link_stroke(d))
      .style('stroke-opacity', d => skin.link_stroke_opacity(d));
  }
  function setLinkColor(node) {
    if (!viz.children()(node)) return;
    viz.children()(node).forEach((child) => {
      const $child = child;
      $child.vz_link_color = node.vz_link_color;
      setLinkColor($child);
    });
  }
  function prepColorData() {
    if (!skin || !viz.data()) return;
    const nodes = viz.data();
    viz.children()(nodes).forEach((n, i) => {
      const node = n;
      node.vz_link_color = skin.link_colors[i % skin.link_colors.length];
      setLinkColor(node);
    });
    skinDirty = false;
    dataDirty = false;
  }
  const callbacks = [
    {on: 'update.theme', callback: applyTheme},
    {on: 'data_prepped.theme', callback: prepColorData},
  ];
  function applyCallbacks() {
    callbacks.forEach(function (d) {
      viz.on(d.on, d.callback);
    });
  }
  function removeCallbacks() {
    callbacks.forEach(function (d) {
      viz.on(d.on, null);
    });
  }
  function theme() {
    applyCallbacks();
  }
  theme();
  theme.apply = function (s) {
    if (arguments.length > 0) {
      theme.skin(s);
    }
    applyTheme();
    return theme;
  };
  theme.release = function () {
    if (!viz) return;
    skin = $skins.None;
    applyTheme();
    removeCallbacks();
    viz = null;
  };
  theme.viz = function (_) {
    if (!arguments.length) {
      return viz;
    }
    if (viz) {
      removeCallbacks();
    }
    viz = _;
    applyCallbacks();
    return _;
  };
  theme.skin = function (_) {
    if (arguments.length === 0) {
      return skin;
    }
    if ($skins[_]) {
      skinDirty = true;
      skin = $skins[_];
    } else {
      throw new Error(`theme/weightedtree.js - skin  ${_} does not exist.`);
    }
    return theme;
  };
  theme.skins = function () {
    return $skins;
  };
  theme.skinDirty = skinDirty;
  theme.dataDirty = dataDirty;
  theme.fontSize = fontSize;
  theme.themeskin = skin;
  return theme;
};
export default tree;
