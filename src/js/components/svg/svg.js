import util from '../core/util';

const svg = {
  filter: {},
  gradient: {},
  text: {},
};
// This function creates a SVG drop shadow filter
svg.filter.dropShadow = function (viz, dx, dy, dev) {
  const f = `${Math.round(dx * 100)}_${Math.round(dy * 100)}_${Math.round(dev * 100)}`;
  const id = viz.id();
  // const defs = selection.select('svg defs').data([null]).enter().append('defs');
  const defs = util.getDefs(viz);
  const filter = defs.selectAll(`#vz_filter_${id}_${f}`).data([f]).enter()
    .append('filter')
    .attr('id', `vz_filter_${id}_${f}`)
    .attr('class', 'vz-svg-filter-dropShadow')
    .attr('width', '300%')
    .attr('height', '300%');

  filter.append('feGaussianBlur').attr('in', 'SourceAlpha').attr('stdDeviation', dev);
  filter.append('feOffset').attr('dx', dx).attr('dy', dy);
  filter.append('feComponentTransfer').append('feFuncA').attr('type', 'linear').attr('slope', 0.2);
  const merge = filter.append('feMerge');
  merge.append('feMergeNode');
  merge.append('feMergeNode').attr('in', 'SourceGraphic');

  return (`#vz_filter_${id}_${f}`);
};

// Creates a color blend gradient across two colors and a given angle
svg.gradient.blend = function (viz, color1, color2, direction) {
  const c = String(color1).replace('#', '') + String(color2).replace('#', '');
  const id = `vz_gradient_blend_${viz.id()}_${c}}`;
  let x1;
  let x2;
  let y1;
  let y2;

  if (direction === 'horizontal') {
    x1 = '100%';
    x2 = '0%';
    y1 = '0%';
    y2 = '0%';
  } else {
    x1 = '0%';
    x2 = '0%';
    y1 = '100%';
    y2 = '0%';
  }
  const defs = util.getDefs(viz);
  const gradient = defs.selectAll(`#${id}`).data([c]).enter()
    .append('linearGradient')
    .attr('id', id)
    .attr('class', 'vz-svg-gradient-blend')
    .attr('x1', x1)
    .attr('x2', x2)
    .attr('y1', y1)
    .attr('y2', y2);
  gradient.append('stop').attr('offset', '0%').attr('stop-color', color1);
  gradient.append('stop').attr('offset', '100%').attr('stop-color', color2);

  return defs.selectAll(`#${id}`);
};

// Creates a color fade gradient to a given opacity in a given direction
svg.gradient.fade = function (
  viz, color, direction, opacity = [0.75, 0.9], ratio = [0, 1]) {
  const c = String(color).replace('#', '');
  const id = `vz_gradient_fade_${viz.id()}_${c}`;
  let x1;
  let x2;
  let y1;
  let y2;

  if (direction === 'horizontal') {
    x1 = '0%';
    x2 = '100%';
    y1 = '0%';
    y2 = '0%';
  } else {
    x1 = '0%';
    x2 = '0%';
    y1 = '100%';
    y2 = '0%';
  }
  const defs = util.getDefs(viz);
  const gradient = defs.selectAll(`#${id}`).data([c]).enter()
    .append('linearGradient')
    .attr('id', id)
    .attr('class', 'vz-svg-gradient-fade')
    .attr('x1', x1)
    .attr('x2', x2)
    .attr('y1', y1)
    .attr('y2', y2);

  gradient.append('stop')
    .attr('offset', `${(ratio[0] * 100)}%`)
    .attr('stop-color', color)
    .attr('stop-opacity', opacity[0]);
  gradient.append('stop')
    .attr('offset', `${(ratio[1] * 100)}%`)
    .attr('stop-color', color)
    .attr('stop-opacity', opacity[1]);
  return defs.selectAll(`#${id}`);
};

// Creates a radial fade gradient
svg.gradient.radialFade = function (
  viz, color, opacity = [0.75, 0.9], ratio = [0, 1]) {
  const c = String(color).replace('#', '');
  const id = `vz_gradient_radial_fade${viz.id()}_${c}`;
  const defs = util.getDefs(viz);
  const gradient = defs.selectAll(`#${id}`).data([c]).enter()
    .append('radialGradient')
    .attr('id', id)
    .attr('class', 'vz-svg-gradient-radial-fade');

  gradient.append('stop')
    .attr('offset', `${(ratio[0] * 100)}%`)
    .attr('stop-color', color)
    .attr('stop-opacity', opacity[0]);
  gradient.append('stop')
    .attr('offset', `${(ratio[1] * 100)}%`)
    .attr('stop-color', color)
    .attr('stop-opacity', opacity[1]);
  return defs.selectAll(`#${id}`);
};

// Creates a gradient that makes a given color darker.
svg.gradient.darker = function (viz, color, direction) {
  const c = String(color).replace('#', '');
  const id = `vz_gradient_darker_${viz.id()}_${c}`;
  const defs = util.getDefs(viz);
  let x1;
  let x2;
  let y1;
  let y2;

  if (direction === 'horizontal') {
    x1 = '100%';
    x2 = '0%';
    y1 = '0%';
    y2 = '0%';
  } else {
    x1 = '0%';
    x2 = '0%';
    y1 = '100%';
    y2 = '0%';
  }
  const gradient = defs.selectAll(`#${id}`).data([c]).enter()
    .append('linearGradient')
    .attr('class', 'vz-gradient-darker')
    .attr('id', id)
    .attr('x1', x1)
    .attr('x2', x2)
    .attr('y1', y1)
    .attr('y2', y2);

  gradient.append('stop')
    .attr('offset', '0%')
    .attr('stop-color', color)
    .attr('stop-opacity', 0.75);
  gradient.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', d3.rgb(color).darker())
    .attr('stop-opacity', 0.9);
  return defs.selectAll(`#${id}`);
};
// Creates a single line path that can be used for texts along an arc
svg.text.arcPath = function (r, t) {
  const radian = 0.0174533;
  const d = {};
  d.angle = t;
  d.startAngle = d.angle - (179 * radian);
  d.endAngle = d.angle + (179 * radian);
  const pd = d3.svg.arc().innerRadius(r).outerRadius(r)(d);
  const justArc = /[Mm][\d\.\-e,\s]+[Aa][\d\.\-e,\s]+/;
  const arcD = justArc.exec(pd)[0];
  return arcD;
};

export default svg;
