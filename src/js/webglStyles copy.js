const oldColor = [255, 160, 110]
const newColor = [180, 255, 200]
const size = 16

export const style = {
  variables: {
    filterShape: 'all'
  },
  filter: [
    'any',
    ['==', ['var', 'filterShape'], 'all'],
    ['==', ['var', 'filterShape'], ['get', 'shape']]
  ],
  symbol: {
    symbolType: 'image',
    src: 'data/ufo_shapes.png',
    size: size,
    color: [
      'interpolate',
      ['linear'],
      ['get', 'year'],
      1950,
      oldColor,
      2013,
      newColor
    ],
    rotateWithView: false,
    offset: [0, 0],
    textureCoord: [
      'match',
      ['get', 'shape'],
      'light',
      [0, 0, 0.25, 0.5],
      'sphere',
      [0.25, 0, 0.5, 0.5],
      'circle',
      [0.25, 0, 0.5, 0.5],
      'disc',
      [0.5, 0, 0.75, 0.5],
      'oval',
      [0.5, 0, 0.75, 0.5],
      'triangle',
      [0.75, 0, 1, 0.5],
      'fireball',
      [0, 0.5, 0.25, 1],
      [0.75, 0.5, 1, 1]
    ]
  }
}