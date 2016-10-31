import * as d3 from 'd3';
import svg from '../svg/svg';

const radialLinearea = function (v) {
  // This is the viz we will be styling
  let viz = v;
  // This is the holder for the active skin
  let skin = null;
  // Some meta information for the skins to use in styling
  const backgroundGradient = svg.gradient.blend(viz, '#000', '#000');
  const businessColors = d3.scale.category20();
  // A utilty function that creates the gradient backgrounds.
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
      color: '#02C3FF',
      stroke_colors: ['#FFA000', '#FF5722', '#F57C00', '#FF9800', '#FFEB3B'],
      fill_colors: ['#C50A0A', '#C2185B', '#F57C00', '#FF9800', '#FFEB3B'],
      grad0: '#000000',
      grad1: '#474747',
      background_transition: materialBackground,
      line_stroke(d, i) {
        return this.stroke_colors[i % 5];
      },
      line_over_stroke(d, i) {
        return d3.rgb(this.stroke_colors[i % 5]).brighter();
      },
      line_opacity() {
        return (this.layout() === viz.layout.STREAM) ? 0.4 : 0.6;
      },
      area_fill(d, i) {
        const url = svg.gradient
          .radialFade(viz, this.fill_colors[i % 5], [1, 0.35]).attr('id');
        return `url(#${url})`;
      },
      area_fill_opacity() {
        return (this.layout() === viz.layout.OVERLAP) ? 0.7 : 0.9;
      },
      xAxis_font_weight: 200,
      yAxis_line_stroke: '#FFF',
      yAxis_line_opacity: 0.25,
      class: 'vz-skin-default'
    },
    Sunset: {
      name: 'Sunset',
      labelColor: '#D8F433',
      color: '#02C3FF',
      stroke_colors: ['#CD57A4', '#B236A3', '#FA6F7F', '#FA7C3B', '#E96B6B'],
      fill_colors: ['#89208F', '#C02690', '#D93256', '#DB3D0C', '#B2180E'],
      grad1: '#7D1439',
      grad0: '#000',
      background_transition: materialBackground,
      line_stroke(d, i) {
        return this.stroke_colors[i % 5];
      },
      line_over_stroke(d, i) {
        return d3.rgb(this.stroke_colors[i % 5]).brighter();
      },
      line_opacity() {
        return (this.layout() === viz.layout.STREAM) ? 0.4 : 0.9;
      },
      area_fill(d, i) {
        const url = svg.gradient
          .radialFade(viz, this.fill_colors[i % 5], [1, 0.35]).attr('id');
        return `url(#${url})`;
      },
      area_fill_opacity() {
        return (this.layout() === viz.layout.OVERLAP) ? 0.8 : 1;
      },
      xAxis_font_weight: 200,
      yAxis_line_stroke: '#D8F433',
      yAxis_line_opacity: 0.25,
      class: 'vz-skin-default'
    },
    Ocean: {
      name: 'Ocean',
      labelColor: '#FFF',
      color: '#02C3FF',
      stroke_colors: ['#001432', '#001432', '#001432', '#001432', '#001432'],
      grad1: '#390E1D',
      grad0: '#92203A',
      background_transition() {
        viz.selection().select('.vz-background').transition(1000).style('fill-opacity', 0);
      },
      line_stroke() {
        return '#FFF';
      },
      line_over_stroke() {
        return '#FFF';
      },
      line_opacity() {
        return 0.3;
      },
      area_fill() {
        const url = svg.gradient.radialFade(viz, '#FFF', [1, 0.35]).attr('id');
        return `url(#${url})`;
      },
      area_fill_opacity() {
        return (this.layout() === viz.layout.OVERLAP) ? 0.2 : 0.7;
      },
      xAxis_font_weight: 200,
      yAxis_line_stroke: '#FFF',
      yAxis_line_opacity: 0.25,
      class: 'vz-skin-ocean'
    },
    Neon: {
      name: 'Neon',
      labelColor: '#FFF',
      color: '#02C3FF',
      stroke_colors: ['#FFA000', '#FF5722', '#F57C00', '#FF9800', '#FFEB3B'],
      fill_colors: ['#C50A0A', '#C2185B', '#F57C00', '#FF9800', '#FFEB3B'],
      grad0: '#000000',
      grad1: '#474747',
      background_transition: materialBackground,
      line_stroke() {
        return '#FFF';
      },
      line_over_stroke() {
        return '#FFF';
      },
      line_opacity() {
        return (this.layout() === viz.layout.STREAM) ? 0.2 : 0.4;
      },
      area_fill() {
        return '#D1F704';
      },
      area_fill_opacity(d, i) {
        const p = d3.scale.linear().range([0.1, 0.8])
          .domain([0, viz.data().length])(i);
        return (this.layout() === viz.layout.OVERLAP ? p * 0.8 : p);
      },
      xAxis_font_weight: 200,
      yAxis_line_stroke: '#FFF',
      yAxis_line_opacity: 0.25,
      class: 'vz-skin-default'
    },
    Business: {
      name: 'Business',
      labelColor: '#000',
      color: '#000',
      stroke_colors: ['#FFA000', '#FF5722', '#F57C00', '#FF9800', '#FFEB3B'],
      fill_colors: ['#C50A0A', '#C2185B', '#F57C00', '#FF9800', '#FFEB3B'],
      grad0: '#CCC',
      grad1: '#CCC',
      background_transition: materialBackground,
      line_stroke(d, i) {
        return d3.rgb(businessColors(i)).darker();
      },
      line_over_stroke() {
        return '#FFF';
      },
      line_opacity() {
        return 0.7;
      },
      area_fill(d, i) {
        return businessColors(i);
      },
      area_fill_opacity() {
        return ((this.layout() === viz.layout.OVERLAP) ? 0.9 : 0.95);
      },
      xAxis_font_weight: 200,
      yAxis_line_stroke: '#000',
      yAxis_line_opacity: 0.25,
      class: 'vz-skin-default'
    }
  };
  function applyTheme() {
    // If we don't have a skin we want to exit - as there is nothing we can do.
    if (!skin) return;
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
    // Update any of the area paths based on the skin settings
    selection.selectAll('.vz-area')
      .style('fill', function (d, i) {
        return skin.area_fill(d, i);
      })
      .style('fill-opacity', function (d, i) {
        return skin.area_fill_opacity.apply(viz, [d, i]);
      });
    // Update any of the line paths based on the skin settings
    selection.selectAll('.vz-line')
      .style('stroke-width', function () {
        return viz.outerRadius() / 450;
      })
      .style('stroke', function (d, i) {
        return skin.line_stroke(d, i);
      })
      .style('opacity', function (d, i) {
        return skin.line_opacity.apply(viz, [d, i]);
      });
    // Hide all the data points
    selection.selectAll('.vz-data-point').style('opacity', 0);
    // Update the x axis ticks
    selection.selectAll('.vz-radial-x-axis-tick')
      .style('font-weight', skin.xAxis_font_weight)
      .style('fill', skin.labelColor)
      .style('font-weight', 300)
      .style('fill-opacity', 0.4)
      .style('font-size', `${Math.max(8, Math.round(viz.outerRadius() / 25))}px`);
    // Update the y-axis ticks
    selection.selectAll('.vz-y-axis-tick')
      .style('stroke', skin.yAxis_line_stroke)
      .style('stroke-width', 1)
      .style('opacity', skin.yAxis_line_opacity);
    // Update the y-axis tick labels
    selection.selectAll('.vz-y-axis-tick-label')
      .style('font-size', `${Math.max(8, Math.round(viz.outerRadius() / 30))}px`)
      .style('fill', skin.labelColor)
      .style('font-weight', 200)
      .style('fill-opacity', function () {
        return (skin === skins.Business) ? 1 : 0.4;
      });
    // Transition our background
    skin.background_transition();
  }
  // This runs on every mouse over
  function onMouseOver(d, i, j) {
    // Animate the changes to the line path
    viz.selection().selectAll('.vz-line').transition()
      .style('stroke-width', function () {
        return viz.outerRadius() / 270;
      })
      .style('stroke', function (a, b) {
        return skin.line_over_stroke(a, b);
      })
      .style('opacity', function (a, b) {
        return (b === j) ? 1 : 0;
      });
    // Animate reduced opacity on area path
    viz.selection().selectAll('.vz-area').transition()
      .style('opacity', function (a, b) {
        return (b === j) ? 1 : 0.35;
      });
    // Set the stroked dash highlight
    viz.selection().selectAll('.vz-plot')
      .append('circle').attr('class', 'vz-yAxis-mouseover')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', function () {
        return viz.radiusScale()(d.y + d.y0);
      })
      .style('stroke', '#FFF')
      .style('fill', 'none')
      .style('stroke-dasharray', function () {
        return `${viz.outerRadius() / 80},${viz.outerRadius() / 80}`;
      });
    // Reduce the contrast on the y axis ticks
    viz.selection().selectAll('.vz-y-axis-tick').style('opacity', 0.1);
    // Remove any previous point tips
    viz.selection().selectAll('.vz-point-tip').remove();
    // Add a highlight circle
    const g = d3.select(this);
    g.append('circle')
      .attr('class', 'vz-point-tip')
      .attr('r', 4)
      .style('fill', '#000')
      .style('stroke', '#FFF')
      .style('stroke-width', 2)
      .style('pointer-events', 'none');
  }
  // This runs on every mouse out
  function onMouseOut() {
    // Animate the line paths back to original settings
    viz.selection().selectAll('.vz-line').transition()
      .style('stroke-width', function () {
        return viz.outerRadius() / 450;
      })
      .style('stroke', function (d, i) {
        return skin.line_stroke(d, i);
      })
      .style('opacity', function (d, i) {
        return skin.line_opacity.apply(viz, [d, i]);
      });
    // Animate area opacity back to original
    viz.selection().selectAll('.vz-area').transition()
      .style('opacity', 1);
    // Remove dashed line highlight
    viz.selection().selectAll('.vz-yAxis-mouseover').remove();
    // Remove the data tip
    viz.selection().selectAll('.vz-point-tip').remove();
    // Put the y-axis ticks back to original opacity
    viz.selection().selectAll('.vz-y-axis-tick')
      .style('opacity', skin.yAxis_line_opacity);
  }
  // Fires on every viz.measure()
  function onMeasure() {
    // Set the correct orientation and ticks for the y axis lines
    viz.yAxis()
      .tickSize(viz.outerRadius())
      .ticks((viz.layout() === viz.layout.OVERLAP) ? 5 : 7)
      .orient('left');
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
  theme();
  return theme;
};

export default radialLinearea;
