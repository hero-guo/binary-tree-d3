'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _config = require('./config');

var opt = _interopRequireWildcard(_config);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var theme = function theme(viz) {
  var fontSize = Math.max(8, Math.round(viz.width() / 75));
  var config = null || opt;
  var sk = config.None;
  function applyTheme() {
    var skin = sk(viz, fontSize);
    if (!skin) return;
    var selection = viz.selection();
    selection.selectAll('.vz-weighted_tree-node circle').style('stroke', function (d) {
      return skin.node_stroke(d);
    }).style('stroke-opacity', function (d) {
      return skin.node_stroke_opacity(d);
    }).style('fill', function (d) {
      return skin.node_fill(d);
    }).style('fill-opacity', function (d) {
      return skin.node_fill_opacity(d);
    });

    selection.selectAll('.vz-weighted_tree-node text').style('font-size', skin.font_size()).style('fill', skin.label_color).style('fill-opacity', function (d) {
      return skin.text_fill_opacity(d);
    });

    selection.selectAll('.vz-weighted_tree-link').style('stroke', function (d) {
      return skin.link_stroke(d);
    }).style('stroke-opacity', function (d) {
      return skin.link_stroke_opacity(d);
    });
  }
  function setLinkColor(node) {
    if (!viz.children()(node)) return;
    viz.children()(node).forEach(function (child) {
      var $child = child;
      $child.vz_link_color = node.vz_link_color;
      setLinkColor($child);
    });
  }
  function prepColorData() {
    var skin = sk(viz, fontSize);
    if (!skin || !viz.data()) return;
    var nodes = viz.data();
    viz.children()(nodes).forEach(function (n, i) {
      var node = n;
      node.vz_link_color = skin.link_colors[i % skin.link_colors.length];
      setLinkColor(node);
    });
  }
  var callbacks = [{ on: 'update.theme', callback: applyTheme }, { on: 'data_prepped.theme', callback: prepColorData }];
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
    } else if (_lodash2.default.isFunction(s)) {
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
exports.default = theme;