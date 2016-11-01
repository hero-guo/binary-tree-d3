import vizs from '../viz/vizs';
import util from '../core/util';
import svg from '../svg/svg';

const linearea = function (v) {
  let viz = v;
  let skin = null;
  const backgroundGradient = svg.gradient.blend(viz, '#000', '#000');
  const businessColors = d3.scale.category20();
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
        return (this.layout() === vizs.layout.STREAM) ? 0.6 : 0.8;
      },
      area_fill(d, i) {
        const url = svg.gradient
          .fade(viz, this.fill_colors[i % 5], 'vertical', [0.35, 1]).attr('id');
        return `url(#${url})`;
      },
      area_fill_opacity() {
        return (this.layout() === vizs.layout.OVERLAP) ? 0.7 : 0.9;
      },
      xAxis_font_weight: 200,
      yAxis_line_stroke: '#FFF',
      yAxis_line_opacity: 0.25,
      data_point_stroke(d, i) {
        return this.stroke_colors[i % 5];
      },
      data_point_fill() {
        return '#FFF';
      },
      class: 'vz-skin-default'
    },
    Sunset: {
      name: 'Sunset',
      labelColor: '#D8F433',
      color: '#02C3FF',
      stroke_colors: ['#CD57A4', '#B236A3', '#FA6F7F', '#FA7C3B', '#E96B6B'],
      fill_colors: ['#89208F', '#C02690', '#D93256', '#DB3D0C', '#B2180E'],
      grad1: '#390E1D',
      grad0: '#92203A',
      background_transition: materialBackground,
      line_stroke(d, i) {
        return this.stroke_colors[i % 5];
      },
      line_over_stroke(d, i) {
        return d3.rgb(this.stroke_colors[i % 5]).brighter();
      },
      line_opacity() {
        return (this.layout() === vizs.layout.STREAM) ? 0.4 : 0.9;
      },
      area_fill(d, i) {
        const url = svg.gradient
          .fade(viz, this.fill_colors[i % 5], 'vertical', [0.5, 1]).attr('id');
        return `url(#${url})`;
      },
      area_fill_opacity() {
        return (this.layout() === vizs.layout.OVERLAP) ? 0.8 : 1;
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
        return '#000';
      },
      line_over_stroke() {
        return '#FFF';
      },
      line_opacity() {
        return 0.3;
      },
      area_fill() {
        return '#FFF';
      },
      area_fill_opacity(d, i) {
        return ((i + 1) / viz.data().length) *
          ((this.layout() === vizs.layout.OVERLAP) ? 0.8 : 0.85);
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
        return (this.layout() === vizs.layout.STREAM) ? 0.4 : 0.6;
      },
      area_fill() {
        return '#D1F704';
      },
      area_fill_opacity(d, i) {
        return ((i + 1) / this.data().length) *
          ((this.layout() === vizs.layout.OVERLAP) ? 0.6 : 0.8);
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
      grad1: '#EEE',
      background_transition: materialBackground,
      line_stroke(d, i) {
        return d3.rgb(businessColors(i)).darker();
      },
      line_over_stroke(d, i) {
        return d3.rgb(businessColors(i)).darker().darker();
      },
      line_opacity() {
        return 0.7;
      },
      area_fill(d, i) {
        return businessColors(i);
      },
      area_fill_opacity() {
        return ((this.layout() === vizs.layout.OVERLAP) ? 0.8 : 0.9);
      },
      xAxis_font_weight: 200,
      yAxis_line_stroke: '#000',
      yAxis_line_opacity: 0.25,
      class: 'vz-skin-default'
    }
  };
  function applyTheme() {
    // If we don't have a skin we want to exit - as there is nothing we can do.
    if (!skin || skin == null) return;
    // The width and height of the viz
    const w = viz.width();
    const h = viz.height();
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
    // Style the area paths
    selection.selectAll('.vz-area')
      .style('fill', function (d, i) {
        return skin.area_fill(d, i);
      })
      .style('fill-opacity', function (d, i) {
        return skin.area_fill_opacity.apply(viz, [d, i]);
      });
    // Style the line paths
    selection.selectAll('.vz-line')
      .style('stroke-width', function () {
        return h / 450;
      })
      .style('stroke', function (d, i) {
        return skin.line_stroke(d, i);
      })
      .style('opacity', function (d, i) {
        return skin.line_opacity.apply(viz, [d, i]);
      });
    // Hide all data points
    selection.selectAll('.vz-data-point').style('opacity', 0);
    // Update the bottom axis (dynamically adjust font size)
    selection.selectAll('.vz-bottom-axis')
      .style('font-weight', skin.xAxis_font_weight)
      .style('fill', skin.labelColor)
      .style('font-weight', 300)
      .style('fill-opacity', 0.8)
      .style('font-size', `${Math.max(8, Math.round(w / 65))}px`)
      .style('opacity', function () {
        return w > 399 ? 1 : 0;
      });
    // Update the left axis
    selection.selectAll('.vz-left-axis line')
      .style('stroke', skin.yAxis_line_stroke)
      .style('stroke-width', 1)
      .style('opacity', skin.yAxis_line_opacity);
    // Update the left axis text (dynamically adjust font size)
    selection.selectAll('.vz-left-axis text')
      .style('font-size', `${Math.max(8, Math.round(w / 65))}px`)
      .style('fill', skin.labelColor)
      .style('fill-opacity', 0.8);
    // Run the background transition
    skin.background_transition();
  }
  function onMouseOver(d, i, j) {
    viz.selection().selectAll('.vz-line').transition()
      .style('stroke', function (a, b) {
        return skin.line_over_stroke(a, b);
      })
      .style('opacity', function (a, b) {
        return (b === j) ? 1 : 0;
      });
    // Anmiate the area paths to be less bright unless it is the selcted one
    viz.selection().selectAll('.vz-area').transition()
      .style('opacity', function (a, b) {
        return (b === j) ? 1 : 0.35;
      });
    // Remove any data tips
    viz.selection().selectAll('.vz-point-tip').remove();
    // Create a data tip circle for the appropriate data point.
    const g = d3.select(this);
    g.append('circle')
      .attr('class', 'vz-point-tip')
      .attr('r', 4)
      .style('fill', '#000')
      .style('stroke', '#FFF')
      .style('stroke-width', 2)
      .style('pointer-events', 'none');
  }
  function onMouseOut() {
    // Put all the lines back to original styling.
    viz.selection().selectAll('.vz-line')
      .transition()
      .style('stroke', function (a, b) {
        return skin.line_stroke(a, b);
      })
      .style('opacity', function (a, b) {
        return skin.line_opacity.apply(viz, [a, b]);
      });
    // Put all areas back to full opacity
    viz.selection().selectAll('.vz-area').transition()
      .style('opacity', 1);
    // Remove any data tip circles
    viz.selection().selectAll('.vz-point-tip').remove();
  }
  function onMeasure() {
    viz.yAxis().tickSize(
      -util.size(viz.margin(), viz.width(), viz.height()).width
    ).ticks(5).orient('left');
    viz.xAxis().tickSize(
      -util.size(viz.margin(), viz.width(), viz.height()).width
    );
  }
  const callbacks = [
    {on: 'measure.theme', callback: onMeasure},
    {on: 'update.theme', callback: applyTheme},
    {on: 'mouseover.theme', callback: onMouseOver},
    {on: 'mouseout.theme', callback: onMouseOut}
  ];
  function applyCallbacks() {
    callbacks.forEach(function (d) {
      viz.on(d.on, d.callback);
    });
  }
  // Create our function chained theme object
  function theme() {
    // Bind our callbacks
    applyCallbacks();
  }
  theme.apply = function (s) {
    if (arguments.length > 0) {
      theme.skin(s);
    }
    applyTheme();
    return theme;
  };
  theme.release = function () {
    if (!viz) return;
    viz.selection().attr('class', null);
    callbacks.forEach(function (d) {
      viz.on(d.on, null);
    });
    viz = null;
  };
  theme.viz = function (_) {
    if (!arguments.length) {
      return viz;
    }
    viz = _;
    applyCallbacks();
    return false;
  };
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
  theme.skins = function () {
    return skins;
  };
  theme();
  return theme;
};

export default linearea;
