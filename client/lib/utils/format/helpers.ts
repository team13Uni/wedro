import { format } from 'date-fns';

/**
 * Internalized NumberFormat instance
 * @param {string} locale
 * @param {Intl.NumberFormatOptions} settings
 * @return {Intl.NumberFormat}
 * @constructor
 */
export const NumberFormat = (locale: string, settings?: Intl.NumberFormatOptions) =>
	Intl.NumberFormat(locale, {
		minimumFractionDigits: 0,
		maximumFractionDigits: 2,
		...settings,
	});

/**
 * Number formatter
 * @param {number} value
 * @param {string} locale
 * @param {Intl.NumberFormatOptions} settings
 */
export const formatNumber = (value: number | bigint, locale: string, settings?: Intl.NumberFormatOptions) =>
	NumberFormat(locale, settings).format(value);


/**
 * Date formatter
 * @param {Date | number} date
 * @param {string} dateFormat
 * @param {FormatDateOptions} options
 * @return {string}
 */
export const formatDate = (date: Date | number, dateFormat: string, options?: FormatDateOptions): string => format(date, dateFormat, options);

/**
 * Date formatter options type
 * @export
 */
export type FormatDateOptions = {
	locale?: Locale;
	weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
	firstWeekContainsDate?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
	useAdditionalWeekYearTokens?: boolean;
	useAdditionalDayOfYearTokens?: boolean;
};
