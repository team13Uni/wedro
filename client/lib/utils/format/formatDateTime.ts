import { format, formatDistanceToNow, isSameHour } from 'date-fns';

/**
 * Returns formatted date range as string
 * @param {Date | number} startDate //?
 * @return {string}
 */
export const formatDateTime = (date: Date): string => {
	const currentTimeAndDate = new Date();

	if (isSameHour(currentTimeAndDate, date)) {
		return formatDistanceToNow(date, { addSuffix: true });
	}

	return format(date, "d.M.Y ' at ' k:m");
};
