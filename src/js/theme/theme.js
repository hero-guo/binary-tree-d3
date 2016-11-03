import _ from 'lodash';
import * as opt from './config';

const theme = function (viz) {
  const fontSize = Math.max(8, Math.round(viz.width() / 75));
  const config = null || opt;
  let sk = config.None;
  function applyTheme() {
    const skin = sk(viz, fontSize);
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
    const skin = sk(viz, fontSize);
    if (!skin || !viz.data()) return;
    const nodes = viz.data();
    viz.children()(nodes).forEach((n, i) => {
      const node = n;
      node.vz_link_color = skin.link_colors[i % skin.link_colors.length];
      setLinkColor(node);
    });
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
  function setTheme() {
    applyCallbacks();
  }
  setTheme();
  setTheme.skin = function (s) {
    /*s 可以是字符串和自定义皮肤函数*/
    if (arguments.length === 0) {
      return sk;
    } else if (_.isFunction(s)) {
      sk = s;
    } else if (config[s]) {
      sk = config[s];
    } else {
      throw new Error('arguments should be string or function');
    }
    return setTheme;
  };
  setTheme.fontSize = fontSize;
  setTheme.themeskin = function () {
    return sk(viz, fontSize);
  };
  return setTheme;
};
export default theme;
