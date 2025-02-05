import dayjs from 'dayjs';
import { DateRange } from '@models/inquiry.model';

export function formatDateRange(dateRange?: DateRange | null) {
  if (!dateRange?.start) {
    return '';
  }

  const { start, end } = dateRange;

  if (!end || start.getTime() === end.getTime()) {
    return dayjs(start).format('MMM D, YYYY');
  } else {
    const startDate = dayjs(start);
    const endDate = dayjs(end);

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
}
