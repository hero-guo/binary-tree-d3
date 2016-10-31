import * as d3 from 'd3';
import svg from '../svg/svg';
import util from '../core/util';

const scatter = function (v) {
  let viz = v;
  let skin = null;
  const backgroundGradient = svg.gradient.blend(viz, '#000', '#000');
  const dispatch = d3.dispatch('mouseover', 'mouseout');
  function materialBackground() {
    viz.selection().selectAll('.vz-background').style('fill-opacity', 1);
    backgroundGradient.selectAll('stop')
      .transition()
      .duration(500)
      .attr('stop-color', function (d, i) {
        return (i === 0) ? skin.grad0 : skin.grad1;
      });
  }
  const skins = {
    Fire: {
      name: 'Fire',
      labelColor: '#FFF',
      labelFill: '#C50A0A',
      stroke_colors: ['#C50A0A', '#C2185B', '#F57C00', '#FF9800', '#FFEB3B'],
      fill_colors: ['#C50A0A', '#C2185B', '#F57C00', '#FF9800', '#FFEB3B'],
      grad0: '#000000',
      grad1: '#474747',
      background_transition: materialBackground,
      yAxis_line_stroke: '#FFF',
      yAxis_line_opacity: 0.25,
      node_stroke(d, i) {
        return this.stroke_colors[i % 5];
      },
      node_fill(d, i) {
        return this.fill_colors[i % 5];
      },
      node_fill_opacity() {
        return 0.5;
      },
      class: 'vz-skin-fire'
    },
    Sunset: {
      name: 'Sunset',
      labelColor: '#FFF',
      labelFill: '#00236C',
      stroke_colors: ['#CD57A4', '#B236A3', '#FA6F7F', '#FA7C3B', '#E96B6B'],
      fill_colors: ['#89208F', '#C02690', '#D93256', '#DB3D0C', '#B2180E'],
      grad1: '#390E1D',
      grad0: '#7C1B31',
      background_transition: materialBackground,
      yAxis_line_stroke: '#FFF',
      yAxis_line_opacity: 0.25,
      node_stroke(d, i) {
        return this.stroke_colors[i % 5];
      },
      node_fill(d, i) {
        return this.fill_colors[i % 5];
      },
      node_fill_opacity() {
        return 0.7;
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
      yAxis_line_stroke: '#FFF',
      yAxis_line_opacity: 0.25,
      node_stroke() {
        return '#FFF';
      },
      node_fill() {
        return '#D1F704';
      },
      node_fill_opacity() {
        return 0.6;
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
      yAxis_line_stroke: '#FFF',
      yAxis_line_opacity: 0.25,
      node_stroke() {
        return '#00F';
      },
      node_fill() {
        return '#FFF';
      },
      node_fill_opacity() {
        return 0.4;
      },
      class: 'vz-skin-ocean'
    }
  };
  function applyTheme() {
    if (!skin) return;
    const w = viz.width();
    const sw = Math.min(viz.width(), viz.height()) / 80;
    const selection = viz.selection();
    selection.attr('class', skin.class);
    selection.selectAll('.vz-background')
      .attr('fill', function () {
        return `url(#${backgroundGradient.attr('id')})`;
      });
    selection.selectAll('.vz-plot-background').style('opacity', 0);
    selection.selectAll('.vz-scatter-bottom-axis')
      .style('font-weight', skin.xAxis_font_weight)
      .style('fill', skin.labelColor)
      .style('font-size', `${Math.max(8, Math.round(w / 85))}px`)
      .style('opacity', function () {
        return w > 399 ? 1 : 0;
      });
    // Update the left axis
    selection.selectAll('.vz-scatter-left-axis line')
      .style('stroke', skin.yAxis_line_stroke)
      .style('stroke-width', 1)
      .style('opacity', skin.yAxis_line_opacity);
    // Update the left axis text
    selection.selectAll('.vz-scatter-left-axis text')
      .style('font-size', `${Math.max(8, Math.round(w / 85))}px`)
      .style('fill', skin.labelColor)
      .style('fill-opacity', 0.6);
    // Update the scatter plots
    selection.selectAll('.vz-scatter-node')
      .style('stroke-width', sw)
      .style('stroke-opacity', 0)
      .style('stroke', function (d, i) {
        return skin.node_stroke(d, i);
      })
      .style('fill', function (d, i) {
        return skin.node_fill(d, i);
      })
      .style('fill-opacity', function (d, i) {
        return skin.node_fill_opacity(d, i);
      });
    skin.background_transition();
  }
  function onMeasure() {
    viz.yAxis()
      .tickSize(-util.size(viz.margin(), viz.width(), viz.height()).width)
      .orient('left');
    viz.xAxis()
      .tickSize(-util.size(viz.margin(), viz.width(), viz.height()).width);
  }
  function onMouseOver(e, d, i) {
    // Reduce opacity of all nodes
    viz.selection().selectAll('.vz-scatter-node').style('opacity', 0.15);
    // Higlight the opacity of the selected node.
    d3.select(e).style('opacity', 1)
      .style('stroke-opacity', 0.5)
      .style('fill-opacity', 0.9);
    dispatch.mouseover(e, d, i);
  }
  function onMouseOut(e) {
    // Return selected node to correct opacity
    d3.select(e).style('opacity', 1)
      .style('fill-opacity', function (d, i) {
        return skin.node_fill_opacity(d, i);
      });
    // Return all nodes to correct opacity
    viz.selection().selectAll('.vz-scatter-node')
      .style('stroke-opacity', 0)
      .style('opacity', 1);
  }
  const callbacks = [
    {on: 'measure.theme', callback: onMeasure},
    {on: 'update.theme', callback: applyTheme},
    {on: 'mouseover.theme', callback: onMouseOver},
    {on: 'mouseout.theme', callback: onMouseOut}
  ];
  // Binds all of our theme callbacks to the viz.
  function applyCallbacks() {
    callbacks.forEach(function (d) {
      viz.on(d.on, d.callback);
    });
  }
  function theme() {
    applyCallbacks();
  }
  theme.apply = function (s) {
    if (arguments.length > 0) {
      theme.skin(s);
    }
    applyTheme();
    return theme;
  };
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
  // This theme allows for callbacks on internal events so any additional style/property changes
  // can be applied AFTER the theme has done its own changes
  theme.on = function (event, listener) {
    dispatch.on(event, listener);
    return theme;
  };
  theme();
  return theme;
};

export default scatter;
