import config from './theme';

const radialProgress = function (v) {
  let viz = v;
  const skins = {
    Alert: {
      name: 'Alert',
      label_color: '#CCC',
      track_fill: '#DDDDDD',
      progress_colors: ['#4CAF50', '#FFC107', '#FF9800', '#E64A19', '#FFEB3B'],
      arc_fill(d, i) {
        return this.progress_colors[i % 5];
      },
      arc_fill_opacity() {
        return 1;
      },
      arc_stroke(d, i) {
        return this.progress_colors[i % 5];
      },
      class: 'vz-skin-alert'
    },
    Fire: {
      name: 'Fire',
      label_color: '#F13870',
      track_fill: '#DDDDDD',
      progress_colors: ['#C50A0A', '#F57C00', '#FF9800', '#FFEB3B', '#C2185B'],
      arc_fill(d, i) {
        return this.progress_colors[i % 5];
      },
      arc_fill_opacity() {
        return 1;
      },
      arc_stroke(d, i) {
        return this.progress_colors[i % 5];
      },
      class: 'vz-skin-fire'
    },
    White: {
      name: 'White',
      label_color: '#FFF',
      track_fill: null,
      arc_fill() {
        return '#FFF';
      },
      arc_fill_opacity(d, i) {
        return 0.85 / Math.exp(i * 0.75);
      },
      arc_stroke() {
        return '#FFF';
      },
      class: 'vz-skin-white'
    },
    Neon: {
      name: 'Neon',
      label_color: '#D1F704',
      track_fill: '#000',
      progress_colors: ['#D1F704', '#A8C102', '#788A04', '#566204', '#383F04'],
      arc_fill(d, i) {
        return this.progress_colors[i % 5];
      },
      arc_fill_opacity() {
        return 1;
      },
      arc_stroke(d, i) {
        return this.progress_colors[i % 5];
      },
      class: 'vz-skin-neon'
    },
    Business: {
      name: 'Business',
      label_color: '#EEE',
      track_fill: '#DDDDDD',
      progress_colors: d3.scale.category20(),
      arc_fill(d, i) {
        return this.progress_colors(i);
      },
      arc_fill_opacity() {
        return 1;
      },
      arc_stroke(d, i) {
        return this.progress_colors(i);
      },
      class: 'vz-skin-business'
    }
  };
  let skin = skins[config.RADIAL_PROGRESS_BUSINESS];
  function applyTheme() {
    if (!skin) return;
    const selection = viz.selection();
    selection.attr('class', skin.class);
    selection.selectAll('.vz-radial_progress-arc')
      .style('fill', function (d, i) {
        return skin.arc_fill(d, i);
      })
      .style('fill-opacity', function (d, i) {
        return skin.arc_fill_opacity(d, i);
      })
      .style('stroke', function (d, i) {
        return skin.arc_stroke(d, i);
      });
    selection.selectAll('.vz-radial_progress-track')
      .style('fill', skin.track_fill);
    // Style the **label**
    selection.selectAll('.vz-radial_progress-label')
      .style('fill', skin.label_color)
      .style('stroke-opacity', 0)
      .style('font-size', viz.radius() * 0.25);
  }
  function onMouseOver() {
    viz.selection().selectAll('.vz-radial_progress-label')
      .style('font-weight', 700);
  }
  function onMouseOut() {
    viz.selection().selectAll('.vz-radial_progress-label')
      .style('font-weight', null);
  }
  const callbacks = [
    {on: 'update.theme', callback: applyTheme},
    {on: 'mouseover.theme', callback: onMouseOver},
    {on: 'mouseout.theme', callback: onMouseOut}
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

export default radialProgress;
