import svg from '../svg/svg';

const halo = function (v) {
  // This is the viz we will be styling
  let viz = v;
  // This is the holder for the active skin
  let skin = null;
  // Some meta information for the skins to use in styling
  const backgroundGradient = svg.gradient.blend(viz, '#000', '#000');
  // Used to set stroke width for nodes
  const nodeStrokeScale = d3.scale.linear();
  function materialBackground() {
    viz.selection().selectAll('.vz-background').style('fill-opacity', 1);
    backgroundGradient.selectAll('stop')
      .transition().duration(500).attr('stop-color', function (d, i) {
        return (i === 0) ? skin.grad0 : skin.grad1;
      });
  }
  const skins = {
    Fire: {
      name: 'Fire',
      labelColor: '#FFF',
      labelFill: '#C50A0A',
      stroke_colors: ['#FFA000', '#FF5722', '#F57C00', '#FF9800', '#FFEB3B'],
      fill_colors: ['#C50A0A', '#C2185B', '#F57C00', '#FF9800', '#FFEB3B'],
      grad0: '#000000',
      grad1: '#474747',
      background_transition: materialBackground,
      link_stroke(d, i) {
        return this.stroke_colors[i % 5];
      },
      link_fill(d, i) {
        return this.fill_colors[i % 5];
      },
      link_fill_opacity: 0.1,
      link_node_fill_opacity: 0.1,
      node_stroke(d, i) {
        return this.stroke_colors[i % 5];
      },
      node_over_stroke() {
        return '#FFF';
      },
      node_fill(d, i) {
        return this.fill_colors[i % 5];
      },
      arc_stroke() {
        return '#FFF';
      },
      arc_fill(d, i) {
        return this.fill_colors[i % 5];
      },
      arc_over_fill() {
        return '#FFEB3B';
      },
      class: 'vz-skin-fire'
    },
    Sunset: {
      name: 'Sunset',
      labelColor: '#FFF',
      labelFill: '#00236C',
      stroke_colors: ['#CD57A4', '#B236A3', '#FA6F7F', '#FA7C3B', '#E96B6B'],
      fill_colors: ['#89208F', '#C02690', '#D93256', '#DB3D0C', '#B2180E'],
      grad0: '#220910',
      grad1: '#571825',
      background_transition: materialBackground,
      link_stroke(d, i) {
        return this.stroke_colors[i % 5];
      },
      link_fill(d, i) {
        return this.fill_colors[i % 5];
      },
      link_fill_opacity: 0.2,
      link_node_fill_opacity: 0.5,
      node_stroke(d, i) {
        return this.stroke_colors[i % 5];
      },
      node_over_stroke() {
        return '#FFF';
      },
      node_fill(d, i) {
        return this.fill_colors[i % 5];
      },
      arc_stroke() {
        return '#FFF';
      },
      arc_fill(d, i) {
        return this.fill_colors[i % 5];
      },
      arc_over_fill() {
        return '#00236C';
      },
      class: 'vz-skin-sunset'
    },
    Neon: {
      name: 'Neon',
      labelColor: '#FFF',
      labelFill: '#005',
      grad0: '#000000',
      grad1: '#474747',
      background_transition: materialBackground,
      link_stroke() {
        return '#D1F704';
      },
      link_fill() {
        return '#D1F704';
      },
      link_fill_opacity: 0.1,
      link_node_fill_opacity: 0.1,
      node_stroke() {
        return '#D1F704';
      },
      node_over_stroke() {
        return '#FFF';
      },
      node_fill() {
        return '#FFF';
      },
      arc_stroke() {
        return '#FFF';
      },
      arc_fill() {
        return '#D1F704';
      },
      arc_over_fill() {
        return '#03F';
      },
      class: 'vz-skin-neon'
    },
    Ocean: {
      name: 'Ocean',
      labelColor: '#FFF',
      labelFill: '#000',
      background_transition() {
        viz.selection().select('.vz-background')
          .transition(1000)
          .style('fill-opacity', 0);
      },
      link_stroke() {
        return '#FFF';
      },
      link_fill() {
        return '#FFF';
      },
      link_fill_opacity: 0.075,
      link_node_fill_opacity: 0.075,
      node_stroke() {
        return '#FFF';
      },
      node_over_stroke() {
        return '#FFF';
      },
      node_fill() {
        return '#FFF';
      },
      arc_stroke() {
        return '#FFF';
      },
      arc_fill() {
        return '#FFF';
      },
      arc_over_fill() {
        return '#000';
      },
      class: 'vz-skin-ocean'
    }
  };
  function onMeasure() {
    const r = Math.min(viz.width(), viz.height() / 2);
    nodeStrokeScale.domain([0, r / 20]);
    nodeStrokeScale.range([0, r / 80]);
  }
  function applyTheme() {
    // If we don't have a skin we want to exit - as there is nothing we can do.
    if (!skin || !viz) return;
    // Grab the d3 selection from the viz so we can operate on it.
    const selection = viz.selection();
    // Set our skin class
    selection.attr('class', skin.class);
    // Update the background
    selection.selectAll('.vz-background').attr('fill', function () {
      return `url(#${backgroundGradient.attr('id')})`;
    });
    // Hide the plot background
    selection.selectAll('.vz-plot-background').style('opacity', 0);
    // Style the link paths
    selection.selectAll('.vz-halo-link-path')
      .style('fill', function (d, i) {
        return skin.link_fill(d, i);
      })
      .style('fill-opacity', skin.link_fill_opacity)
      .style('stroke', function (d, i) {
        return skin.link_stroke(d, i);
      });
    // Style the link nodes (smaller ones)
    selection.selectAll('.vz-halo-link-node')
      .style('fill', function (d, i) {
        return skin.link_fill(d, i);
      })
      .style('fill-opacity', skin.link_node_fill_opacity);
    // Style the main nodes
    selection.selectAll('.vz-halo-node')
      .style('fill', function (d, i) {
        return skin.node_fill(d, i);
      })
      .style('stroke', function (d, i) {
        return skin.node_stroke(d, i);
      })
      .style('stroke-width', function (d) {
        return nodeStrokeScale(d.r);
      });
    // Style the arc slices
    selection.selectAll('.vz-halo-arc-slice').style('fill', function (d, i) {
      return skin.arc_fill(d, i);
    });
    // Style the main arcs
    selection.selectAll('.vz-halo-arc').style('fill', function (d, i) {
      return skin.arc_fill(d, i);
    });
    // Run our background transition
    skin.background_transition();
  }
  function restoreElements() {
    viz.selection().selectAll('.vz-halo-arc')
      .style('fill-opacity', null)
      .style('stroke-opacity', null)
      .style('fill', function (d, i) {
        return skin.arc_fill(d, i);
      });
    viz.selection().selectAll('.vz-halo-node')
      .style('fill-opacity', null)
      .style('stroke-opacity', null)
      .style('stroke', function (d, i) {
        return skin.node_stroke(d, i);
      });
    viz.selection().selectAll('.vz-halo-link-node')
      .style('fill-opacity', skin.link_node_fill_opacity).style('stroke', null);
    viz.selection().selectAll('.vz-halo-link-path')
      .style('fill-opacity', skin.link_fill_opacity)
      .style('stroke-opacity', null);
    viz.selection().selectAll('.vz-halo-arc-slice')
      .style('fill-opacity', null)
      .style('stroke-opacity', null);
  }
  function onMouseOut() {
    restoreElements();
  }
  // demphasizes all elements
  function lowLight() {
    viz.selection().selectAll('.vz-halo-node')
      .style('fill-opacity', 0.1)
      .style('stroke-opacity', 0.05);
    viz.selection().selectAll('.vz-halo-link-node').style('fill-opacity', 0);
    viz.selection().selectAll('.vz-halo-link-path').style('fill-opacity', 0.025);
  }
  function highlightLink(selection) {
    selection.style('fill-opacity', 0.6).style('stroke-opacity', 0.25);
  }
  function highlightNodeStroke(selection) {
    selection.style('stroke-opacity', 0.8).style('stroke', function (d, i) {
      return skin.node_over_stroke(d, i);
    });
  }
  function highlightNode(selection) {
    selection
      .style('fill-opacity', 0.8)
      .style('stroke-opacity', 0.5)
      .style('stroke', function (d, i) {
        return skin.node_over_stroke(d, i);
      });
  }
  function highlightLinkNode(selection) {
    selection
      .style('fill-opacity', 0.5)
      .style('stroke-opacity', 0.7)
      .style('stroke', function (d, i) {
        return skin.node_over_stroke(d, i);
      });
  }
  function highlightArcSlice(selection) {
    selection.style('fill-opacity', 0.8).style('stroke-opacity', 0.8);
  }
  function highlightArc(selection) {
    selection
      .style('fill-opacity', 0.65)
      .style('stroke-opacity', 0.8)
      .style('fill', function (d, i) {
        return skin.arc_over_fill(d, i);
      });
  }
  // Each time the user mouses over a halo arc group this fires
  function arconMouseOver(e, d) {
    // demphasize all elements
    lowLight();
    // Highlight relevant elements associated with the halo arc group.
    highlightArc(d3.select(e));
    highlightLink(
      viz.selection().selectAll(`.vz-halo-link-path.halo-key_${d.data.key}`)
    );
    d.data.values.forEach(function (a) {
      highlightNode(
        viz.selection().selectAll(`.vz-halo-node.node-key_${viz.nodeKey()(a)}`)
      );
    });
  }
  // Fires each time the user mouses over a link path
  function linkonMouseOver(e, d) {
    // demphasize all elements
    lowLight();
    // Highlight all nodes, arcs, and arc slices associated with the links.
    highlightLink(d3.select(e.parentNode).selectAll('.vz-halo-link-path'));
    highlightArc(
      viz.selection().selectAll(`.vz-halo-arc.halo-key_${viz.haloKey()(d.data)}`)
    );
    highlightArcSlice(d3.select(e.parentNode).selectAll('.vz-halo-arc-slice'));
    highlightNodeStroke(
      viz.selection().selectAll(`.vz-halo-node.node-key_${viz.nodeKey()(d.data)}`)
    );
    highlightLinkNode(d3.select(e.parentNode).selectAll('circle'));
  }
  // Fires each time the user mouses over a node
  function nodeonMouseOver(e, d) {
    // demphasize all elements
    lowLight();
    // For each link associated with the node, highlight all arc slices
    const links = viz.selection()
      .selectAll(`.vz-halo-link-path.node-key_${d.key}`);
    links.each(function (a) {
      const arc = viz.selection()
        .selectAll(`.vz-halo-arc.halo-key_${viz.haloKey()(a.data)}`);
      highlightArc(arc);
    });
    // Highlight all links associated with the node.
    highlightLink(links);
    // Highlight all arc slices associated with the node
    highlightArcSlice(viz.selection()
      .selectAll(`.vz-halo-arc-slice.node-key_${d.key}`));
    // Highlight the node itself.
    highlightLinkNode(viz.selection()
      .selectAll(`.vz-halo-node.node-key_${d.key}`));
  }
  // On mouse out for ANY element we restore all elements
  // Restores all elements to original style settings
  const callbacks = [
    {on: 'measure.theme', callback: onMeasure},
    {on: 'update.theme', callback: applyTheme},
    {on: 'nodeover.theme', callback: nodeonMouseOver},
    {on: 'nodeout.theme', callback: onMouseOut},
    {on: 'arcover.theme', callback: arconMouseOver},
    {on: 'arcout.theme', callback: onMouseOut},
    {on: 'linkover.theme', callback: linkonMouseOver},
    {on: 'linkout.theme', callback: onMouseOut}
  ];
  function applyCallbacks() {
    callbacks.forEach(function (d) {
      viz.on(d.on, d.callback);
    });
  }
  function theme() {
    // Bind our callbacks
    applyCallbacks();
  }
  // Our primary external function that fires the 'apply' function.
  theme.apply = function (s) {
    if (arguments.length > 0) {
      theme.skin(s);
    }
    applyTheme();
    return theme;
  };
  // Binds all of our theme callbacks to the viz.
  // Removes viz from skin
  theme.release = function () {
    if (!viz) return;
    viz.selection().attr('class', null);
    callbacks.forEach(function (d) {
      viz.on(d.on, null);
    });
    viz = null;
  };
  // Returns the selected viz or sets one and applies the callbacks
  theme.viz = function (_) {
    if (!arguments.length) {
      return viz;
    }
    viz = _;
    applyCallbacks();
    return false;
  };
  // Sets the skin for the theme
  theme.skin = function (_) {
    if (arguments.length === 0) {
      return skin;
    }
    if (skins[_]) {
      skin = skins[_];
    } else {
      throw new Error(`theme/linearea.js - skin ${_} does not exist.`);
    }
    return theme;
  };
  // Returns all of the skins
  theme.skins = function () {
    return skins;
  };
// Create our function chained theme object
  theme();
  return theme;
};

export default halo;
