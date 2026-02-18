self.onmessage = function (e) {
  const { features } = e.data;
  if (!features || !features.length) {
    postMessage([]);
    return;
  }

  function getDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  let minDate = null;
  let maxDate = null;
  const histogram = {};
  for (const feature of features) {
    const dateStr = getDateKey(feature.date);

    if (!histogram[dateStr]) {
      histogram[dateStr] = 0;
    }
    histogram[dateStr]++;

    const date = new Date(dateStr);
    if (date < minDate || minDate === null) minDate = date;
    if (date > maxDate || maxDate === null) maxDate = date;
  }

  // Initialize histogram object with 0 counts for all month-year combos
  let currentDate = minDate;
  while (currentDate <= maxDate) {
    const key = getDateKey(currentDate);
    if (!histogram[key]) {
      histogram[key] = 0;
    }
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  postMessage(histogram);
};
