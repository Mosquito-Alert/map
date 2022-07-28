function GeojsonFromCsv (data, fields, sdFlag, gridSize) {
  const raws = data.split(/\r?\n/)
  const headers = raws.shift().split(',')
  const lonPos = headers.indexOf(fields.lon)
  const latPos = headers.indexOf(fields.lat)
  const probPos = headers.indexOf(fields.est)
  let sdPos
  let sdGeojson
  let sdPoint

  if (sdFlag) {
    sdPos = headers.indexOf('sd')
    sdGeojson = {
      type: 'FeatureCollection',
      features: []
    }
  }

  const polygonGeojson = {
    type: 'FeatureCollection',
    features: []
  }

  for (let a = 0; a < raws.length; a++) {
    const raw = raws[a].split(',')
    const minLon = parseFloat(raw[lonPos])
    const minLat = parseFloat(raw[latPos])
    if (isNaN(minLon) || isNaN(minLat)) {
      continue
    }
    const maxLon = minLon + 0.25
    const maxLat = minLat + gridSize

    // Get color for each cell grid
    const probValue = parseFloat(raw[probPos])

    // COLORS
    // const probColor = ''
    // if (probValue <= ranges[0].maxValue) probColor = ranges[0].color
    // else if (probValue<=ranges[1].maxValue) probColor = ranges[1].color
    // else if (probValue<=ranges[2].maxValue) probColor = ranges[2].color
    // else probColor = ranges[3].color;
    const polygon = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [minLon, minLat], [minLon, maxLat],
          [maxLon, maxLat], [maxLon, minLat],
          [minLon, minLat]
        ]]
      },
      properties: {
        v: probValue,
        // color: color_prob,
        sd: parseFloat(raw[sdPos])
      }
    }
    if (sdFlag) {
      const sdValue = parseFloat(raw[probPos])
      // const sdColor = ''
      // if (sdValue <= ranges_sd[0].maxValue) sdColor = ranges_sd[0].color
      // else if (sdValue<=ranges_sd[1].maxValue) sdColor = ranges_sd[1].color
      // else if (sdValue<=ranges_sd[2].maxValue) sdColor = ranges_sd[2].color
      // else sdColor = ranges_sd[3].color

      sdPoint = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [minLon + (gridSize / 2), minLat + (gridSize / 2)]
        },
        properties: {
          v: sdValue,
          // color: sdColor,
          sd: parseFloat(raw[sdPos])
        }
      }
    }

    polygonGeojson.features.push(polygon)
    if (sdFlag) {
      sdGeojson.features.push(sdPoint)
    }
  }

  if (sdFlag) {
    return { est: polygonGeojson, sd: sdGeojson }
  } else {
    return { est: polygonGeojson }
  }
}

export { GeojsonFromCsv }
