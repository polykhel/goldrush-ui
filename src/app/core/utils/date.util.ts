import dayjs from 'dayjs';

export function formatDateRange(dates?: Date[] | null) {
  if (!dates || dates.length === 0) {
    return '';
  }

  if (
    dates.length === 1 ||
    (dates.length === 2 &&
      (!dates[1] || dates[0].getTime() === dates[1].getTime()))
  ) {
    return dayjs(dates[0]).format('MMM D, YYYY');
  } else if (dates.length === 2 && dates[1]) {
    const startDate = dayjs(dates[0]);
    const endDate = dayjs(dates[1]);

    const startMonth = startDate.format('MMM');
    const endMonth = endDate.format('MMM');
    const startDay = startDate.format('D');
    const endDay = endDate.format('D');
    const startYear = startDate.format('YYYY');
    const endYear = endDate.format('YYYY');

    if (startMonth === endMonth && startYear === endYear) {
      return `${startMonth} ${startDay}-${endDay}, ${startYear}`;
    } else if (startYear === endYear) {
      return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${startYear}`;
    } else {
      return `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`;
    }
  }

  return 'Too many dates';
}
