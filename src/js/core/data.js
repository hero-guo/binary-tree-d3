const data = {};

// Takes data produced by a d3.nest() call and aggregates the aggProperties
// according to the aggregateFunction
// This also will take all nth deep child nodes and create the same properties
// and associated values on the parent nest nodes.

vizuly.data.aggregateNest = function (nest, aggProperties, aggregateFunction) {

  //Go down to the last depth and get source values so we can roll them up t

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
export default data;
