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
const tree = vizWeightedtree(document.getElementById('wrapper'));
//set theme
treeTheme(tree).skin(theme.WEIGHTED_TREE_AXIIS);

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
  //Remove empty child nodes left at end of aggregation and add unqiue ids
  function removeEmptyNodes(n, parentId, childId) {
    const node = n;
    if (!node) return;
    node.id = `${parentId}_${childId}`;
    if (node.values) {
      for (let i = node.values.length - 1; i >= 0; i -= 1) {
        node.id = `${parentId}_${i}`;
        if (!node.values[i].key && !node.values[i].Level4) {
          node.values.splice(i, 1);
        } else {
          removeEmptyNodes(node.values[i], node.id, i);
        }
      }
    }
  }
  removeEmptyNodes({values: nest}, '0', '0');
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
      console.log(d);
      return d.id;
    })
    .value(function (d) {
      return Number(d[`agg_${valueField}`]);
    })
    .fixedSpan(-1)
    .label(function (d) {
      return trimLabel(d.key || (d[`Level${d.depth}`]));
    })
    .on('measure', () => {
      tree.tree().nodeSize([100, 0]);
    })
    // .on('mouseover', onMouseOver)
    // .on('mouseout', onMouseOut)
    .on('click', onClick);
  tree.width(404).height(750).update();
  // tree.toggleNode(treeData.values[2]);
  // tree.toggleNode(treeData.values[2].values[0]);
  // tree.toggleNode(treeData.values[3]);
}
d3.csv('./demo/data/weightedtree_federal_budget.csv', function (csv) {
  treeData.values = prepData(csv);
  initialize();
});
