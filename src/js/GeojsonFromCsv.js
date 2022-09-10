function GeojsonFromCsv (data, fields, gridSize) {
  const raws = data.split(/\r?\n/)
  const headers = raws.shift().split(',')
  const lonPos = headers.indexOf(fields.lon)
  const latPos = headers.indexOf(fields.lat)
  const probPos = headers.indexOf(fields.est)
  const sePos = headers.indexOf(fields.se)
  let sdPoint

  const sdGeojson = {
    type: 'FeatureCollection',
    features: []
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
    const maxLon = minLon + gridSize // 0.25
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
        v: probValue
        // color: color_prob,
        // sd: parseFloat(raw[sdPos])
      }
    }

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
        // v: sdValue,
        // color: sdColor,
        se: parseFloat(raw[sePos])
      }
    }
    polygonGeojson.features.push(polygon)
    sdGeojson.features.push(sdPoint)
  }

  return { est: polygonGeojson, se: sdGeojson }
}

// function Star (cx, cy) {
//   const r = 75
//   const lados = 5
//   const paso = 2

//   function points (cx, cy, r, lados, paso) {
//     const a = 360 / lados
//     let points = (cx + r) + ',' + cy + ' '
//     for (let i = 1; i <= lados; i++) {
//       const aRad = ((Math.PI / 180) * (a * i)) * paso
//       const Xp = cx + r * Math.cos(aRad)
//       const Yp = cy + r * Math.sin(aRad)
//       points += Xp + ',' + Yp + ' '
//     }
//     return points
//   }
//   var estrella = document.getElementById("estrella")
//   estrella.setAttribute("points", Star(cx, cy, r, lados, paso))
// }
export { GeojsonFromCsv }
