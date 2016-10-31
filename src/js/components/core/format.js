import * as d3 from 'd3';

const format = {};

// Used for time series axis to format dates in following hierarchy
// - YEAR
// -- Month
// --- Month-Day
format.YEAR_Mon_MonDay = d3.time.format.multi([
    ['.%L', function (d) { return d.getMilliseconds(); }],
    [':%S', function (d) { return d.getSeconds(); }],
    ['%I:%M', function (d) { return d.getMinutes(); }],
    ['%I %p', function (d) { return d.getHours(); }],
    ['%a %d', function (d) { return d.getDay() && d.getDate() !== 1; }],
    ['%b %d', function (d) { return d.getDate() !== 1; }],
    ['%b', function (d) { return d.getMonth(); }],
    ['20%y', function () { return true; }]
]);
export default format;
