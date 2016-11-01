import * as d3 from 'd3';
import component from '../core/component';
import util from '../core/util';

const weightedTree = function (parent) {
  const wrap = document.getElementById('wrapper').getBoundingClientRect();
  const properties = {
    data: null,              // Expects a single numeric value
    margin: {                // Our marign object
      top: '5%',           // Top margin
      bottom: '5%',        // Bottom margin
      left: '50%',          // Left margintreeData
      right: '8%'          // Right margin
    },
    key: null,                //used to create unique node key
    tree: d3.layout.tree(),   //
    children: null,           // Used to determine child nodes
    duration: 500,            // This the time in ms used for any component generated transitions
    width: 1000,               // Overall width of component
    height: 300,              // Height of component
    value: null,             // Radius value of the nodes and line weights;
    branchPadding: -1,
    fixedSpan: -1,
    label(d) {
      return d;
    }
  };
  //Create our viz and type it
  const viz = component.create(
    parent, {}, properties, ['node_refresh', 'data_prepped']
  );
  const scope = viz.scope;
  viz.type = 'viz.chart.weighted_tree';
  let dataIsDirty = true;
  let refreshNeeded = false;
  component.on('data_change.internal', function () {
    dataIsDirty = true;
  });
  // const colors = ['#bd0026', '#fecc5c', '#fd8d3c', '#f03b20', '#B02D5D',
  //   '#9B2C67', '#982B9A', '#692DA7', '#5725AA', '#4823AF',
  //   '#d7b5d8', '#dd1c77', '#5A0C7A', '#5A0C7A'];
  const size = util.size(scope.margin, scope.width, scope.height);
  const tree = scope.tree;
  const nodeScale = d3.scale.sqrt();        // Scale used for node radius
  let root;
  let nodes;                         // Data storage for display tree
  let maxDepth = 0;
  let depthSpan = 0;
  let svg;
  let g;
  let background;
  let plot;
  let plotBackground = [];
  let defs = [];
  let linkPlot;
  let nodePlot;
  const maxValues = {};
  const minValues = {};
  const diagonal = d3.svg.diagonal().projection(d => [d.x, d.y]);
  const nodeRadius = function (node) {
    if (node.depth === 0) return nodeScale.range()[1] / 2;
    nodeScale.domain([minValues[node.depth], maxValues[node.depth]]);
    return nodeScale(scope.value(node));
  };
  function initialize() {
    scope.selection.attr('class', 'vz-weighted_tree-viz');
    svg = scope.selection.append('svg')
      .attr('id', scope.id)
      .style('overflow', 'visible')
      .attr('class', 'vizuly vz-weighted_tree-viz');
    defs = util.getDefs(component);
    background = svg.append('rect').attr('class', 'vz-background');
    g = svg.append('g').attr('class', 'vz-weighted_tree-viz');
    plot = g.append('g')
      .attr('class', 'vz-weighted_tree-plot')
      .attr('clip-path', `url(#${scope.id}_plotClipPath)`);
    plotBackground = plot.append('rect').attr('class', 'vz-plot-background');
    linkPlot = plot.append('g').attr('class', 'vz-weighted_tree-link-plot');
    nodePlot = plot.append('g').attr('class', 'vz-weighted_tree-node-plot');
    // Tell everyone we are done initializing
    scope.dispatch.initialize();
  }
  function setChildren(n) {
    const node = n;
    if (scope.children(node)) {
      if (!node._children) {
        node.children = scope.children(node);
        node.children.forEach(function (d) {
          const $d = d;
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
    tree.size([size.height, size.width]);
    if (dataIsDirty === true || refreshNeeded) {
      refreshData();
      let fn;
      if (dataIsDirty === true) {
        fn = function (d) {
          const $d = d;
          if ($d.children) {
            $d._children = $d.children;
            $d._children.forEach(fn);
            $d.children = null;
          }
        };
        root.children.forEach(fn);
      }
      dataIsDirty = false;
      refreshNeeded = false;
      //scope.selection.selectAll('.vz-weighted_tree-node').remove();
    }
    let scale;
    if (scope.branchPadding === -1) {
      scale = Math.min(size.height, size.width) / scope.children(scope.data).length;
    } else {
      scale = Math.min(size.height, size.width) * scope.branchPadding;
    }
    nodeScale.range([1.5, scale / 2]);
    tree.nodeSize([scale, 0]);
    depthSpan = (scope.fixedSpan > 0) ? scope.fixedSpan : size.width / (maxDepth + 1);
    //Set max/min values
    for (let i = 1; i < maxDepth + 1; i += 1) {
      const vals = nodes.filter(function (d) {
        return d.depth === i;
      });
      maxValues[i] = d3.max(vals, function (d) {
        return scope.value(d);
      });
      minValues[i] = d3.min(vals, function (d) {
        return scope.value(d);
      });
    }
    // Tell everyone we are done making our measurements
    scope.dispatch.measure();
  }
  function scrollTop(top) {
    function scrollTopTween(scrolltop) {
      return function () {
        const i = d3.interpolateNumber(this.scrollTop, scrolltop);
        return function (t) {
          this.scrollTop = i(t);
        };
      };
    }
    scope.selection.transition().duration(scope.duration)
      .tween('scrolltween', scrollTopTween(top));
  }
  function endUpdate(transition, callback) {
    let n = 0;
    transition
      .each(function () {
        n += 1;
      })
      .each('end', function (...rest) {
        !(n -= 1) && callback.apply(this, rest);
      });
  }
  function updateNode(rootNode) {
    //rootNode 可以显示指定节点
    nodes = tree(root).reverse();
    const links = tree.links(nodes);
    function positionNodes(rn, ns) {
      const minY = d3.min(ns, d => d.y);
      const maxY = d3.max(ns, d => d.x);
      const maxX = d3.max(ns, d => d.depth) * depthSpan;
      let h = Math.max(scope.height, (maxY - minY) + size.top);
      const w = Math.max(scope.width, maxX + (scope.width * 0.2) + size.left);
      if ((size.height / 2) + maxY > h) {
        h = (size.height / 2) + maxY + 100;
      }
      svg.transition().duration(scope.duration)
        .style('height', `${h}px`)
        .style('width', `${w}px`);
      const offsetY = Math
          .max(0, -minY - (size.height / 2)) + (100 / 2);
      ns.forEach(function (d) {
        const $d = d;
        // if (tree.nodeSize()) d.x= d.x + size.height/2;
        $d.y = d.depth * depthSpan;
        //Adjust y position to accomodate offset
        $d.x = (d.x + offsetY) - 100;
      });
      //Scroll to position of the rootNode node.
      scrollTop(rn.x);
    }
    positionNodes(rootNode, nodes);
    // Update the nodes…
    const node = nodePlot.selectAll('.vz-weighted_tree-node')
      .data(nodes, function (d) {
        const $d = d;
        return $d.vz_tree_id || ($d.vz_tree_id = scope.key($d));
      });
    // Enter any new nodes at the parent's previous position.
    const nodeEnter = node.enter().append('g')
      .attr('class', function (d) {
        return `vz-weighted_tree-node vz-id-${d.vz_tree_id}`;
      })
      .attr('transform', function (d) {
        const y = d.y0 ? d.y0 : rootNode.y0 || 0;
        const x = d.x0 ? d.x0 : rootNode.x0 || 0;
        return `translate(${x}, ${y})`;
      })
      .on('click', function (d, i) {
        scope.dispatch.click(this, d, i);
      })
      .on('dblclick', function (d, i) {
        scope.dispatch.dblclick(this, d, i);
      })
      .on('mouseover', function (d, i) {
        scope.dispatch.mouseover(this, d, i);
      })
      .on('mouseout', function (d, i) {
        scope.dispatch.mouseout(this, d, i);
      });

    nodeEnter.append('circle')
      .attr('class', '.vz-weighted_tree-node-circle')
      .attr('r', 1e-6)
      .style('cursor', 'pointer');

    nodeEnter.append('text')
      .attr('x', function (d) {
        return d.children || d.children ? -10 : 10;
      })
      .attr('dy', '.35em')
      .attr('text-anchor', function (d) {
        return d.children || d.children ? 'end' : 'start';
      })
      .style('pointer-events', 'none')
      .text(function (d) {
        return scope.label(d);
      });

    // Update the links…
    const link = linkPlot.selectAll('.vz-weighted_tree-link')
      .data(links, function (d) {
        return d.target.vz_tree_id;
      });
    // Enter any new links at the parent's previous position.
    link.enter().append('path')
      .attr('class', function (d) {
        return `vz-weighted_tree-link vz-id-${d.target.vz_tree_id}`;
      })
      .attr('d', function (d) {
        const y = d.target.y0 ? d.target.y0 : rootNode.y0;
        const x = d.target.x0 ? d.target.x0 : rootNode.x0;
        const o = {y, x};
        return diagonal({source: o, target: o});
      })
      .on('mouseover', function (d, i) {
        scope.dispatch.mouseover(this, d, i);
      })
      .on('mouseout', function (d, i) {
        scope.dispatch.mouseout(this, d, i);
      })
      .style('stroke-linecap', 'round');
    scope.dispatch.update();
    // Transition nodes to their new position.
    const nodeUpdate = node.transition();
    endUpdate(nodeUpdate, function () {
      scope.dispatch.node_refresh();
    });
    nodeUpdate.duration(scope.duration)
      .attr('transform', function (d) {
        return `translate(${d.x}, ${d.y})`;
      });
    nodeUpdate.select('circle')
      .attr('r', function (d) {
        return nodeRadius(d);
      });
    // Transition exiting nodes to the parent's new position.
    const nodeExit = node.exit().transition()
      .duration(scope.duration)
      .attr('transform', function (d) {
        const $d = d;
        $d.x0 = null;
        $d.y0 = null;
        return `translate(${rootNode.x}, ${rootNode.y})`;
      })
      .remove();
    nodeExit.select('circle')
      .attr('r', 1e-6);
    nodeExit.select('text');
    // Transition links to their new position.
    link.transition()
      .duration(scope.duration)
      .attr('d', diagonal)
      .style('stroke-width', function (d) {
        return nodeRadius(d.target) * 2;
      });
    // Transition exiting nodes to the parent's new position.
    link.exit().transition()
      .duration(scope.duration)
      .attr('d', function () {
        const o = {x: rootNode.x, y: rootNode.y};
        return diagonal({source: o, target: o});
      })
      .remove();
    // Stash the old positions for transition.
    nodes.forEach(function (d) {
      const $d = d;
      $d.x0 = d.x;
      $d.y0 = d.y;
    });
  }
  function toggleNode(d) {
    const $d = d;
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
    svg.attr('width', scope.width).attr('height', scope.height);
    background.attr('width', scope.width).attr('height', scope.height);
    plot
      .style('width', size.width)
      .style('height', size.height)
      .attr(
        'transform', `translate(${wrap.width / 2}, ${size.top + (size.height / 2)})`
      );
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
};
export default weightedTree;
