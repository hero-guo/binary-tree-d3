/**
 * Created by guoguangyu on 2016/10/27.
 */
/*global document*/
import '../css/index.styl';
import {
  d3Tree,
  theme,
} from 'index';

const treeData = {};
const valueField = 'Federal';
const valueFields = ['Federal', 'State', 'Local'];
const tree = d3Tree(document.getElementById('wrapper'), {
  margin: {
    top: '10%',           // Top margin
    bottom: '5%',        // Bottom margin
    left: '50%',          // Left margintreeData
    right: '8%',          // Right margin
    rotate: 45          // Right margin
  }
});
const settheme = theme(tree).skin('Axiis');
const themeskin = settheme.themeskin();

const aggregateNest = function (nest, aggProperties, aggregateFunction) {
  let deepestChildNode = nest[0];
  while (deepestChildNode.values) {
    deepestChildNode = deepestChildNode.values[0];
  }
  const childProperties = [];
  Object.getOwnPropertyNames(deepestChildNode).forEach((name) => {
    childProperties.push(name);
  });
  function setSourceFields(child, parent) {
    const $child = child;
    const $parent = parent;
    if (parent) {
      for (let i = 0; i < childProperties.length; i += 1) {
        const childProperty = childProperties[i];
        if (child[childProperty] !== undefined) {
          $child[`childProp_${childProperty}`] = child[childProperty];
        }
        $parent[`childProp_${childProperty}`] =
          (child[`childProp_${childProperty}`]) ?
            child[`childProp_${childProperty}`] : child[childProperty];
      }
    }
  }
  function aggregateNodes(nodes, parent) {
    for (let y = 0; y < nodes.length; y += 1) {
      const node = nodes[y];
      if (node.values) {
        aggregateNodes(node.values, node);
        for (let z = 0; z < node.values.length; z += 1) {
          const child = node.values[z];
          for (let i = 0; i < aggProperties.length; i += 1) {
            if (isNaN(node[`agg_${aggProperties[i]}`])) {
              node[`agg_${aggProperties[i]}`] = 0;
            }
            node[`agg_${aggProperties[i]}`] = aggregateFunction(
              node[`agg_${aggProperties[i]}`], child[`agg_${aggProperties[i]}`]);
          }
        }
      } else {
        for (let i = 0; i < aggProperties.length; i += 1) {
          node[`agg_${aggProperties[i]}`] = Number(node[aggProperties[i]]);
          if (isNaN(node[`agg_${aggProperties[i]}`])) {
            node[`agg_${aggProperties[i]}`] = 0;
          }
        }
      }
      setSourceFields(node, parent);
    }
  }
  aggregateNodes(nest);
};
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
  aggregateNest(nest, valueFields, function (a, b) {
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
function zoom() {
  tree.svg.g.attr(
    'transform',
    `translate(${d3.event.translate}) scale(${d3.event.scale})`
  );
}
function drag() {
  tree.svg.g.attr('transform', `translate(${d3.event.dx}, ${d3.event.dy})`);
}
function everyParent(d) {
  if (!d) return;
  const selection = tree.selection();
  selection.selectAll(`.vz-id-${d.vz_tree_id} circle`)
    .style('fill-opacity', 0.9);
  selection.selectAll(`path.vz-id-${d.vz_tree_id}`)
    .style('stroke-opacity', 0.8);
  selection.selectAll(`.vz-id-${d.vz_tree_id} text`)
    .transition().style('font-size', settheme.fontSize * 1.25)
    .style('font-weight', 'bold');
  if (d.parent) {
    everyParent(d.parent);
  }
}
function onMouseOver(e, d) {
  everyParent(d);
}
function onMouseOut() {
  const selection = tree.selection();
  selection.selectAll('.vz-weighted_tree-node circle')
    .style('fill', d => themeskin.node_fill(d))
    .style('fill-opacity', d => themeskin.node_fill_opacity(d));
  selection.selectAll('.vz-weighted_tree-node text')
    .transition().style('font-size', settheme.fontSize)
    .style('font-weight', 'normal');
  selection.selectAll('.vz-weighted_tree-link')
    .style('stroke-opacity', d => themeskin.link_stroke_opacity(d));
}
function onClick(g, d) {
  tree.toggleNode(d);
}
function initialize() {
  tree.data(treeData)
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
    .on('measure', () => {
      tree.tree().nodeSize([100, 0]);
    })
    .on('zoom', zoom)
    .on('drag', drag)
    .on('mouseover', onMouseOver)
    .on('mouseout', onMouseOut)
    .on('click', onClick);
  tree.width('100%').height(1000).update();
  // tree.toggleNode(treeData.values[2]);
  // tree.toggleNode(treeData.values[2].values[0]);
  // tree.toggleNode(treeData.values[3]);
}
d3.csv('./demo/data/weightedtree_federal_budget.csv', function (csv) {
  treeData.values = prepData(csv);
  initialize();
});
