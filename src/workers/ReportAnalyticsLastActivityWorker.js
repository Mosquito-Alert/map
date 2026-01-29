self.onmessage = function (e) {
  const { features, minDate } = e.data;

  const now = new Date();
  postMessage(
    features
      .filter((feature) => {
        const date = new Date(feature.received_at);
        return date >= minDate && date <= now;
      })
      .sort((a, b) => {
        return new Date(b.received_at).getTime() - new Date(a.received_at).getTime();
      })
      .map((feature) => feature.id),
  );
};
