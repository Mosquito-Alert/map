// Spiderfy points based on number of points
// If threre are 2 points, then spread them as a line
// If threre are 3 points, spread as a triangle
// If threre are 4 points, spread as a square
// If threre are 5 points, spread as a pentagon
// If threre are 6 points, spread as a hexagon
// More than six as a spiral

// Each points includes a line to its original coordinates
// Each point of spiral its linked to its closest point

import Feature from 'ol/Feature'
import { LineString } from 'ol/geom'

export function spiderfyPoints (center, features, dist, sep) {
  function distance (p1, p2) {
    return Math.sqrt((p1[0] - p2[0]) + (p1[1] - p2[1]))
  }

  function getClosest (point, Points) {
    let minDistance = 0
    let index = 0
    Points.forEach(function (P, ind) {
      const dist = distance(point, P.getGeometry().getCoordinates())
      if (minDistance === 0) {
        minDistance = dist
        index = ind
      } else if (dist < minDistance) {
        minDistance = dist
        index = ind
      }
    })
    return {
      point: Points[index],
      index: index
    }
  }

  function spiral () {
    const b = sep / (2 * Math.PI)
    let phi = r / b

    features.forEach(function (f, ind) {
      phi += dist / r
      r = b * phi
      x = center[0] + r * Math.cos(phi)
      y = center[1] + r * Math.sin(phi)

      // Override geometry with spiderfied coords
      const sPoint = [x, y]
      f.getGeometry().setCoordinates(sPoint)

      // Get closest point of just calculated  from original features
      // const closest = getClosest(sPoint, features)
      // const closestPoint = closest.point
      // features.splice(closestPoint.index, 1)

      sFeatures.push(f)
      const newLine = new Feature({
        geometry: new LineString([
          // f.get('originalCoords'),
          // closestPoint.values_.geometry.flatCoordinates,
          center,
          f.getGeometry().getCoordinates()
        ])
      })
      Lines.push(newLine)
    })
    return { points: sFeatures, lines: Lines }
  }

  let x, y
  let r = dist
  const sFeatures = []
  const Lines = []

  if (features.length > 6) {
    return spiral()
  } else {
    const alfaInc = (2 * Math.PI) / features.length
    let alfa = Math.PI / 2
    const spiralPoints = []
    features.forEach(function (f, ind) {
      x = center[0] + r * Math.cos(alfa)
      y = center[1] + r * Math.sin(alfa)
      spiralPoints.push([x, y])
      alfa += alfaInc
    })

    spiralPoints.forEach(function (sPoint, ind) {
      const closest = getClosest(sPoint, features)
      const closestPoint = features[closest.index]
      closestPoint.getGeometry().setCoordinates(sPoint)
      sFeatures.push(closestPoint)

      const newLine = new Feature({
        properties: { type: 'LineString' },
        geometry: new LineString([
          // closestPoint.get('originalCoords'),
          center,
          sPoint
        ])
      })
      Lines.push(newLine)
      features.splice(closest.index, 1)
    })
    return { points: sFeatures, lines: Lines }
  }
}

export default spiderfyPoints

// f.get('originalCoords'),
// f.getGeometry().getCoordinates()
