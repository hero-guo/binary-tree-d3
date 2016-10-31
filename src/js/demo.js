/**
 * Created by guoguangyu on 2016/10/27.
 */
/*global document*/
import * as d3 from 'd3';
import '../css/index.styl';

import {
  data,
  vizWeightedtree,
  treeTheme,
  theme
} from './components';

const treeData = {};
const valueField = 'Federal';
const valueFields = ['Federal', 'State', 'Local'];
const rect = document.body.getBoundingClientRect();
const screenWidth = (rect.width < 960) ?
  Math.round(rect.width * 0.95) : Math.round((rect.width - 210) * 0.95);
const screenHeight = 750;
const tree = vizWeightedtree(document.getElementById('wrapper'));
//set theme
treeTheme(tree).skin(theme.WEIGHTED_TREE_AXIIS);
// Set the size of our container element.
d3.selectAll('wrapper')
  .style('width', `${screenWidth}px`)
  .style('height', `${screenHeight}px`);

function prepData(csv) {
  const values = [];
  csv.forEach(function (d) {
    let t = 0;
    for (let i = 0; i < valueFields.length; i += 1) {
      t += Number(d[valueFields[i]]);
    }
    if (t > 0) {
      values.push(d);
    }
  });
  const nest = d3.nest()
    .key(function (d) {
      return d.Level1;
    })
    .key(function (d) {
      return d.Level2;
    })
    .key(function (d) {
      return d.Level3;
    })
    .entries(values);
  //This will be a viz.data function;
  data.aggregateNest(nest, valueFields, function (a, b) {
    return Number(a) + Number(b);
  });

  return nest;
}
function trimLabel(label) {
  return (String(label).length > 20) ? `${String(label).substr(0, 17)}...` : label;
}
function initialize() {
  function onClick(g, d) {
    tree.toggleNode(d);
  }
  tree.data(treeData)
    .width(600)
    .height(600)
    .children(function (d) {
      return d.values;
    })
    .key(function (d) {
      return d.id;
    })
    .value(function (d) {
      return Number(d[`agg_${valueField}`]);
    })
    .fixedSpan(-1)
    .label(function (d) {
      return trimLabel(d.key || (d[`Level${d.depth}`]));
    })
    // .on('measure', onMeasure)
    // .on('mouseover', onMouseOver)
    // .on('mouseout', onMouseOut)
    .on('click', onClick);
  tree.width(1000).height(1000).update();
  tree.toggleNode(tree.scope.data.values[2]);
  tree.toggleNode(tree.scope.data.values[2].values[0]);
  tree.toggleNode(tree.scope.data.values[3]);
  window.sdata = tree.scope.data;
}
d3.csv('./demo/data/weightedtree_federal_budget.csv', function (csv) {
  treeData.values = prepData(csv);
  initialize();
});
