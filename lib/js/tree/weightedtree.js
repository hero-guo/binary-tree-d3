'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _component = require('../core/component');

var _component2 = _interopRequireDefault(_component);

var _util = require('../core/util');

var _util2 = _interopRequireDefault(_util);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var weightedTree = function weightedTree(parent, opt) {
  /***
   * parent父级ID
   * opt树状图margin配置
   ***/
  var wrap = parent.getBoundingClientRect();
  var properties = {
    data: null, // Expects a single numeric value
    margin: { // Our marign object
      top: '10%', // Top margin
      bottom: '5%', // Bottom margin
      left: '50%', // Left margintreeData
      right: '8%', // Right margin
      rotate: 45 // Right margin
    },
    domain: 1,
    rootColor: '#000',
    key: null, //used to create unique node key
    tree: d3.layout.tree(), //
    children: null, // Used to determine child nodes
    duration: 500, // This the time in ms used for any component generated transitions
    width: 1000, // Overall width of component
    height: 300, // Height of component
    value: null, // Radius value of the nodes and line weights;
    branchPadding: -1,
    fixedSpan: -1,
    label: function label(d) {
      return d;
    }
  };
  //Create our viz and type it
  var viz = _component2.default.create(parent, {}, properties, ['node_refresh', 'data_prepped'], opt);
  var scope = viz.scope;
  viz.type = 'viz.chart.weighted_tree';
  var dataIsDirty = true;
  var refreshNeeded = false;
  _component2.default.on('data_change.internal', function () {
    dataIsDirty = true;
  });
  var size = _util2.default.size(scope.margin, scope.width, scope.height);
  var tree = scope.tree;
  var nodeScale = d3.scale.sqrt(); // Scale used for node radius
  var root = void 0;
  var nodes = void 0; // Data storage for display tree
  var maxDepth = 0;
  var depthSpan = 0;
  var svg = void 0;
  var g = void 0;
  var background = void 0;
  var plot = void 0;
  var plotBackground = [];
  var defs = [];
  var linkPlot = void 0;
  var nodePlot = void 0;
  var maxValues = {};
  var minValues = {};
  var diagonal = d3.svg.diagonal().projection(function (d) {
    return [d.x, d.y];
  });
  var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on('zoom', function () {
    scope.dispatch.zoom();
  });
  var dragListener = d3.behavior.drag().on('dragstart', function () {
    d3.event.sourceEvent.stopPropagation();
  }).on('drag', function () {
    scope.dispatch.drag();
  });
  var nodeRadius = function nodeRadius(node) {
    if (node.depth === 0) return 10;
    var domain = 1;
    if (_lodash2.default.isFunction(scope.domain)) {
      domain = scope.domain();
    } else if (_lodash2.default.isNumber(scope.domain)) {
      domain = scope.domain;
    }
    nodeScale.domain([minValues[node.depth], maxValues[node.depth] * domain]);
    return nodeScale(scope.value(node));
  };
  function initialize() {
    scope.selection.attr('class', 'vz-weighted_tree-viz');
    svg = scope.selection.append('svg').attr('id', scope.id).call(zoomListener).call(dragListener).attr('class', 'vizuly vz-weighted_tree-viz');
    defs = _util2.default.getDefs(_component2.default);
    background = svg.append('rect').attr('class', 'vz-background').style('fill', 'none');
    g = svg.append('g').attr('class', 'vz-weighted_tree-viz');
    plot = g.append('g').attr('class', 'vz-weighted_tree-plot').attr('clip-path', 'url(#' + scope.id + '_plotClipPath)');
    plotBackground = plot.append('rect').attr('class', 'vz-plot-background');
    linkPlot = plot.append('g').attr('class', 'vz-weighted_tree-link-plot');
    nodePlot = plot.append('g').attr('class', 'vz-weighted_tree-node-plot');
    viz.svg = { svg: svg, g: g };
    scope.dispatch.initialize();
  }
  function setChildren(n) {
    var node = n;
    if (scope.children(node)) {
      if (!node._children) {
        node.children = scope.children(node);
        node.children.forEach(function (d) {
          var $d = d;
          $d.x0 = node.x;
          $d.y0 = node.y;
          setChildren($d);
        });
      }
    }
  }
  function refreshData() {
    maxDepth = 0;
    setChildren(scope.data);
    root = scope.data;
    root.x0 = 0;
    root.y0 = 0;
    root.vz_link_color = scope.rootColor;
    nodes = tree.nodes(root).reverse();
    nodes.forEach(function (node) {
      if (node.depth === 0) return;
      if (!maxValues[node.depth]) {
        maxValues[node.depth] = -Infinity;
        minValues[node.depth] = Infinity;
      }
      maxDepth = Math.max(maxDepth, node.depth);
    });
    scope.dispatch.data_prepped();
  }
  function measure() {
    viz.validate();
    if (dataIsDirty === true || refreshNeeded) {
      (function () {
        refreshData();
        var _fn = void 0;
        if (dataIsDirty === true) {
          _fn = function fn(d) {
            var $d = d;
            if ($d.children) {
              $d._children = $d.children;
              $d._children.forEach(_fn);
              $d.children = null;
            }
          };
          root.children.forEach(_fn);
        }
        dataIsDirty = false;
        refreshNeeded = false;
        //scope.selection.selectAll('.vz-weighted_tree-node').remove();
      })();
    }
    var scale = void 0;
    if (scope.branchPadding === -1) {
      scale = Math.min(size.height, size.width) / scope.children(scope.data).length;
    } else {
      scale = Math.min(size.height, size.width) * scope.branchPadding;
    }
    nodeScale.range([1.5, scale / 2]);
    depthSpan = scope.fixedSpan > 0 ? scope.fixedSpan : size.width / (maxDepth + 1);
    //Set max/min values

    var _loop = function _loop(i) {
      var vals = nodes.filter(function (d) {
        return d.depth === i;
      });
      maxValues[i] = d3.max(vals, function (d) {
        return scope.value(d);
      });
      minValues[i] = d3.min(vals, function (d) {
        return scope.value(d);
      });
    };

    for (var i = 1; i < maxDepth + 1; i += 1) {
      _loop(i);
    }
    // Tell everyone we are done making our measurements
    scope.dispatch.measure();
  }
  function scrollTop(top) {
    function scrollTopTween(scrolltop) {
      return function () {
        var i = d3.interpolateNumber(this.scrollTop, scrolltop);
        return function (t) {
          this.scrollTop = i(t);
        };
      };
    }
    scope.selection.transition().duration(scope.duration).tween('scrolltween', scrollTopTween(top));
  }
  function endUpdate(transition, callback) {
    var n = 0;
    transition.each(function () {
      n += 1;
    }).each('end', function () {
      for (var _len = arguments.length, rest = Array(_len), _key = 0; _key < _len; _key++) {
        rest[_key] = arguments[_key];
      }

      !(n -= 1) && callback.apply(this, rest);
    });
  }
  function updateNode(rootNode) {
    //rootNode 可以显示指定节点
    nodes = tree(root).reverse();
    var links = tree.links(nodes);
    function positionNodes(rn, ns) {
      var minY = d3.min(ns, function (d) {
        return d.y;
      });
      svg.transition().duration(scope.duration);
      var offsetY = Math.max(0, -minY - size.height / 2) + 100 / 2;
      ns.forEach(function (d) {
        var $d = d;
        // if (tree.nodeSize()) d.x= d.x + size.height/2;
        $d.y = d.depth * depthSpan;
        //Adjust y position to accomodate offset
        $d.x = d.x + offsetY - 100;
      });
      //Scroll to position of the rootNode node.
      scrollTop(rn.x);
    }
    positionNodes(rootNode, nodes);
    // Update the nodes…
    var node = nodePlot.selectAll('.vz-weighted_tree-node').data(nodes, function (d) {
      var $d = d;
      return $d.vz_tree_id || ($d.vz_tree_id = scope.key($d));
    });
    // Enter any new nodes at the parent's previous position.
    var nodeEnter = node.enter().append('g').attr('class', function (d) {
      return 'vz-weighted_tree-node vz-id-' + d.vz_tree_id;
    }).attr('transform', function (d) {
      var y = d.y0 ? d.y0 : rootNode.y0 || 0;
      var x = d.x0 ? d.x0 : rootNode.x0 || 0;
      return 'translate(' + x + ', ' + y + ')';
    }).on('click', function (d, i) {
      scope.dispatch.click(this, d, i);
    }).on('mouseover', function (d, i) {
      scope.dispatch.mouseover(this, d, i);
    }).on('mouseout', function (d, i) {
      scope.dispatch.mouseout(this, d, i);
    });

    nodeEnter.append('circle').attr('class', '.vz-weighted_tree-node-circle').attr('r', 1e-6).style('cursor', 'pointer');

    nodeEnter.append('text').attr('x', function (d) {
      return d.children || d.children ? -10 : 10;
    }).attr('dy', '.35em').attr('transform', function () {
      return 'rotate(' + scope.margin.rotate + ')';
    }).attr('text-anchor', function (d) {
      return d.children || d.children ? 'end' : 'start';
    }).text(function (d) {
      return scope.label(d);
    });

    // Update the links…
    var link = linkPlot.selectAll('.vz-weighted_tree-link').data(links, function (d) {
      return d.target.vz_tree_id;
    });
    // Enter any new links at the parent's previous position.
    link.enter().append('path').style('fill', 'none').attr('class', function (d) {
      return 'vz-weighted_tree-link vz-id-' + d.target.vz_tree_id;
    }).attr('d', function (d) {
      var y = d.target.y0 ? d.target.y0 : rootNode.y0;
      var x = d.target.x0 ? d.target.x0 : rootNode.x0;
      var o = { y: y, x: x };
      return diagonal({ source: o, target: o });
    }).on('mouseover', function (d, i) {
      scope.dispatch.mouseover(this, d, i);
    }).on('mouseout', function (d, i) {
      scope.dispatch.mouseout(this, d, i);
    }).style('stroke-linecap', 'round');
    scope.dispatch.update();
    // Transition nodes to their new position.
    var nodeUpdate = node.transition();
    endUpdate(nodeUpdate, function () {
      scope.dispatch.node_refresh();
    });
    nodeUpdate.duration(scope.duration).attr('transform', function (d) {
      return 'translate(' + d.x + ', ' + d.y + ')';
    });
    nodeUpdate.select('circle').attr('r', function (d) {
      return nodeRadius(d);
    });
    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit().transition().duration(scope.duration).attr('transform', function (d) {
      var $d = d;
      $d.x0 = null;
      $d.y0 = null;
      return 'translate(' + rootNode.x + ', ' + rootNode.y + ')';
    }).remove();
    nodeExit.select('circle').attr('r', 1e-6);
    nodeExit.select('text');
    // Transition links to their new position.
    link.transition().duration(scope.duration).attr('d', diagonal).style('stroke-width', function (d) {
      return nodeRadius(d.target) * 2;
    });
    // Transition exiting nodes to the parent's new position.
    link.exit().transition().duration(scope.duration).attr('d', function () {
      var o = { x: rootNode.x, y: rootNode.y };
      return diagonal({ source: o, target: o });
    }).remove();
    // Stash the old positions for transition.
    nodes.forEach(function (d) {
      var $d = d;
      $d.x0 = d.x;
      $d.y0 = d.y;
    });
  }
  function toggleNode(d) {
    var $d = d;
    if ($d.children) {
      $d._children = $d.children;
      $d.children = null;
    } else {
      $d.children = $d._children;
      $d._children = null;
    }
    updateNode($d);
  }
  viz.update = function (refresh) {
    if (refresh === true) refreshNeeded = true;
    measure();
    svg.attr('width', scope.width).attr('height', scope.height).call(zoomListener);
    background.attr('width', scope.width).attr('height', scope.height);
    plot.style('width', size.width).style('height', size.height).attr('transform', 'translate(' + (wrap.width / 2 + 35) + ', ' + size.top + ')');
    updateNode(root);
    return viz;
  };
  viz.toggleNode = function (d) {
    toggleNode(d);
  };
  viz.plotBackground = plotBackground;
  viz.defs = defs;
  // Returns our glorious viz component :)
  initialize();
  return viz;
}; /*global document*/
exports.default = weightedTree;