self.onmessage = function(e) {
  const { features, minDate, maxDate } = e.data;

  const dateRangeFilter = date => {
    if (minDate && maxDate) {
      return date >= minDate && date <= maxDate;
    } else if (minDate) {
      return date >= minDate;
    } else if (maxDate) {
      return date <= maxDate;
    } else {
      return true;
    }
  };

  // Extract and filter dates in a single pass
  const dates = features.reduce((acc, feature) => {
    // const date = new Date(feature.date);
    const date = feature.date
    if (dateRangeFilter(date)) {
      acc.push(date);
    }
    return acc;
  }, []);

  // Determine minDate and maxDate for the range
  const computedMinDate = minDate || new Date(Math.min(...dates))
  const computedMaxDate = maxDate || new Date(Math.max(...dates, new Date()))

  const result = {};
  let currentDate = computedMinDate;
  // Pre-compute formatted date strings for efficiency
  const formattedDates = dates.map(d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  while (currentDate <= computedMaxDate) {
    const key = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    result[key] = {
      name: key,
      value: 0
    };
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  formattedDates.forEach(item => {
    if (result[item]) {
      result[item].value++;
    }
  });

  postMessage(Object.values(result));
};
