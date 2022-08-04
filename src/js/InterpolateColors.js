// extract numeric r, g, b values from `rgb(nn, nn, nn)` string
function getRgb (color) {
  const [r, g, b, a] = color.replace('rgb(', '')
    .replace(')', '')
    .split(',')
    .map(str => Number(str))

  return {
    r,
    g,
    b,
    a
  }
}

function colorInterpolate (colorA, colorB, intval) {
  const rgbA = getRgb(colorA), rgbB = getRgb(colorB)
  const colorVal = (prop) =>
    Math.round(rgbA[prop] * (1 - intval) + rgbB[prop] * intval)

  return {
    r: colorVal('r'),
    g: colorVal('g'),
    b: colorVal('b'),
    a: 1
  }
}

function getInterpolatedColor (color1, color2, progression) {
  // const div1 = document.getElementById('color1')
  // const color1 = div1.style.backgroundColor
  // const div2 = document.getElementById('color2')
  // const color2 = div2.style.backgroundColor

  const rgbNew = colorInterpolate(
    color1,
    color2, progression
  )
  return `rgb( ${rgbNew.r}, ${rgbNew.g}, ${rgbNew.b}, ${rgbNew.a})`
}

module.exports = {
  getInterpolatedColor,
  colorInterpolate,
  getRgb
}
