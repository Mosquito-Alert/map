import { getHistogramDateKey } from '../components/reports/analytics/utils';

self.onmessage = function (e) {
  const { dateKeys } = e.data;
  if (!dateKeys || !dateKeys.length) {
    postMessage([]);
    return;
  }

  let minDate = null;
  let maxDate = null;
  const histogram = {};
  for (const dateKey of dateKeys) {
    if (!histogram[dateKey]) {
      histogram[dateKey] = 0;
    }
    histogram[dateKey]++;

    const date = new Date(dateKey);
    if (date < minDate || minDate === null) minDate = date;
    if (date > maxDate || maxDate === null) maxDate = date;
  }

  // Initialize histogram object with 0 counts for all month-year combos
  let currentDate = minDate;
  while (currentDate <= maxDate) {
    const key = getHistogramDateKey(currentDate);
    if (!histogram[key]) {
      histogram[key] = 0;
    }
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  postMessage(histogram);
};
