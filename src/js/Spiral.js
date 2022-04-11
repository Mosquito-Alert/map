import Feature from 'ol/Feature'
import { LineString } from 'ol/geom'

export function spiderfyPoints (center, features, dist, sep) {
  function spiral () {
    const b = sep / (2 * Math.PI)
    let phi = r / b

    features.forEach(function (f, ind) {
      phi += dist / r
      r = b * phi
      x = center[0] + r * Math.cos(phi)
      y = center[1] + r * Math.sin(phi)

      f.getGeometry().setCoordinates([x, y])
      sFeatures.push(f)
      const newLine = new Feature({
        geometry: new LineString([
          f.get('originalCoords'),
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
    features.forEach(function (f, ind) {
      x = center[0] + r * Math.cos(alfa)
      y = center[1] + r * Math.sin(alfa)
      alfa += alfaInc
      f.getGeometry().setCoordinates([x, y])
      sFeatures.push(f)
      const newLine = new Feature({
        geometry: new LineString([
          f.get('originalCoords'),
          f.getGeometry().getCoordinates()
        ])
      })
      Lines.push(newLine)
    })
    return { points: sFeatures, lines: Lines }
  }
}

export default spiderfyPoints
