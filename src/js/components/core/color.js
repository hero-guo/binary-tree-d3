const color = {};
// Shifts color hue using a bitmask value
color.shift = function (c) {
  const $color = `0x${c.replace('#', '')}`;
  return `#${(parseInt($color, 16)) + 0x010101}`;
};

export default color;
