self.onmessage = function(e) {

  const { features } = e.data;
  const typeCounts = {};
  const typeColors = {};
  const groupColors = {};

  // Count occurrences and store colors
  features.forEach(feature => {
    const { type, group,typeColor, groupColor }  = feature

    if (!typeCounts[type]) {
      typeCounts[type] = {};
      typeColors[type] = typeColor;
    }

    if (!typeCounts[type][group]) {
      typeCounts[type][group] = 0;
      groupColors[group] = groupColor;
    }

    typeCounts[type][group]++;
  });

  // Convert counts object into the desired data format
  const resultData = Object.keys(typeCounts).map(type => {
    const children = Object.keys(typeCounts[type]).map(group => ({
      name: group,
      value: typeCounts[type][group],
      itemStyle: { color: groupColors[group] }
    }));

    if (children.length === 1) {
      return { name: type, value: children[0].value, itemStyle: { color: typeColors[type] } };
    } else {
      return { name: type, children, itemStyle: { color: typeColors[type] } };
    }
  });

  postMessage(resultData);
}
