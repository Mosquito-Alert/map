self.onmessage = function(e) {
  const { features, minDate } = e.data;

  const now = new Date()
  postMessage(
    features.filter(feature => {
      const date = new Date(feature.date)
      return date >= minDate && date <= now
    }).sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    }).map(feature => feature.id)
  )
};
