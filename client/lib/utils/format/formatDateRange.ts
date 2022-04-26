import { formatDate, FormatDateOptions, isDefined } from '@wedro/utils';
import { isBefore, isSameDay, isSameMonth, isSameYear } from 'date-fns';

/**
 * Returns formatted date range as string
 * @author filipditrich
 * @param {Date | number} startDate
 * @param {Date | number} endDate
 * @param {FormatDateOptions} formatDateOptions
 * @return {string}
 */
export const formatDateRange = (startDate: Date | number, endDate?: Date | number, formatDateOptions?: FormatDateOptions): string => {
	// 0. startDate > endDate -> error
	if (isDefined(endDate) && isBefore(endDate, startDate)) throw new Error('[formatDateRange]: `endDate` cannot be before `startDate`!');

	// 1.1 no `endDate` -> format all in startDate
	// 1.2. same day -> "1. června 2022"
	if (!isDefined(endDate) || isSameDay(startDate, endDate)) {
		return formatDate(startDate, 'PPPP', formatDateOptions);
	}

	// 2. same month, diff day -> "1. - 3. června 2022"
	if (isSameMonth(startDate, endDate)) {
		return `${formatDate(startDate, 'do', formatDateOptions)} - ${formatDate(endDate, 'do MMMM yyyy', formatDateOptions)}`;
	}

	// 3. same year, diff month, diff day -> "1. Bře - 1. Dub 2022"
	if (isSameYear(startDate, endDate)) {
		return `${formatDate(startDate, 'do MMM', formatDateOptions)} - ${formatDate(endDate, 'do MMM yyyy', formatDateOptions)}`;
	}

	// 4. diff year, diff month, diff day -> "1. 3. 2022 - 1. 4. 2023"
	return `${formatDate(startDate, 'do M. yyyy', formatDateOptions)} - ${formatDate(endDate, 'do M. yyyy', formatDateOptions)}`;
};
