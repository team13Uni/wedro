import { getLanguageFromLocale } from '@wedro/hooks/useTranslate';
import {
	formatDate as formatDateUtil,
	FormatDateOptions,
	formatDateRange as formatDateRangeUtil,
	formatNumber as formatNumberUtil,
	isDefined,
} from '@wedro/utils';
import { formatDistance, formatDuration as formatDurationUtil, formatRelative, intervalToDuration, isSameWeek, Locale, parse } from 'date-fns';
import { cs, de, enGB, sk } from 'date-fns/locale';
import { useRouter } from 'next/router';

/**
 * Returns `date-fns` locale from Next.js locale `language`
 * @param {string} language
 * @return {Locale}
 */
export const getDateFnsLocale = (language: string): Locale => {
	// supported date locales (+ en, cs)
	const dateLocales = { de, sk };

	let locale: Locale = cs;
	switch (language) {
		case 'cs':
			break;
		case 'en':
			locale = enGB;
			break;
		default: {
			const candidateLocale = (dateLocales as Record<string, Locale>)[language];
			if (isDefined(candidateLocale)) locale = candidateLocale;
			break;
		}
	}
	return locale;
};

/**
 * Hook that returns common localized formatters
 * @return {{number: (value: number, settings?: Intl.NumberFormatOptions) => any}}
 */
export const useFormat = () => {
	const { locale } = useRouter();
	const language = getLanguageFromLocale(locale);
	const dateFnsLocale = getDateFnsLocale(language);

	// set fixed timezone to 'Europe/Prague'
	const timezone = 'Europe/Prague';

	/**
	 * Localized number formatter
	 * @param {number} value
	 * @param {Intl.NumberFormatOptions} settings
	 * @return {any}
	 */
	const formatNumber = (value: number | bigint, settings?: Intl.NumberFormatOptions) => formatNumberUtil(value, language, settings);

	/**
	 * Localized percent formatter
	 * @param {number} value
	 * @param {Intl.NumberFormatOptions} settings
	 * @return {any}
	 */
	const formatPercent = (value: number, settings?: Intl.NumberFormatOptions) =>
		formatNumberUtil(value, language, {
			maximumFractionDigits: 2,
			...settings,
			style: 'percent',
		});

	/**
	 * Localized date formatter
	 * @param {Date | number} date
	 * @param {string} dateFormat
	 * @param {FormatDateOptions} options
	 * @return {string}
	 */
	const formatDate = (date: Date | number, dateFormat: string, options?: FormatDateOptions) => {
		return formatDateUtil(date, dateFormat, {
			locale: dateFnsLocale,
			...options,
		});
	};

	/**
	 * Localized interval duration formatter
	 * @param {{start: Date | number, end: Date | number}} interval
	 * @param {{format?: string[], zero?: boolean, delimiter?: string, locale?: Locale}} options
	 * @returns {string}
	 */
	const formatIntervalDuration = (
		interval: { start: Date | number; end: Date | number },
		options?: {
			format?: Array<keyof Duration>;
			zero?: boolean;
			delimiter?: string;
			locale?: Locale;
		},
	) => {
		const duration = intervalToDuration(interval);
		return formatDurationUtil(duration, {
			locale: dateFnsLocale,
			delimiter: ', ',
			...options,
		});
	};

	/**
	 * Localized duration formatter
	 * @param {Duration} duration
	 * @param {{format?: string[], zero?: boolean, delimiter?: string, locale?: Locale}} options
	 * @returns {string}
	 */
	const formatDuration = (
		duration: Duration,
		options?: {
			format?: Array<keyof Duration>;
			zero?: boolean;
			delimiter?: string;
			locale?: Locale;
		},
	) => {
		return formatDurationUtil(duration, {
			locale: dateFnsLocale,
			delimiter: ', ',
			...options,
		});
	};

	/**
	 * Parses localized date to Date object
	 * @param {string} dateString
	 * @param {string} dateFormat
	 * @param {FormatDateOptions & {refDate?: Date | number}} options
	 * @returns {Date}
	 */
	const parseDate = (dateString: string, dateFormat: string, options?: FormatDateOptions & { refDate?: Date | number }) => {
		return parse(dateString, dateFormat, options?.refDate || new Date(), {
			locale: dateFnsLocale,
			...options,
		});
	};

	/**
	 * Localized date range formatted
	 * @param {Date | number} startDate
	 * @param {Date | number} endDate
	 * @param {FormatDateOptions} options
	 * @return {string}
	 */
	const formatDateRange = (startDate: Date | number, endDate?: Date | number, options?: FormatDateOptions) => {
		return formatDateRangeUtil(startDate, endDate, {
			locale: dateFnsLocale,
			...options,
		});
	};

	/**
	 * Localized relative date
	 * @param {Date | number} date
	 * @param {string} dateFormat
	 * @param {} options
	 * @return {any}
	 */
	const formatDateRelative = (date: Date | number, dateFormat: string, options?: FormatDateOptions) => {
		const now = new Date();
		if (isSameWeek(now, date)) {
			return formatRelative(date, now, { locale: dateFnsLocale, ...options });
		}

		return formatDate(date, dateFormat, options);
	};

	/**
	 * Localized relative date
	 * @param {Date | number} date
	 * @param {string} dateFormat
	 * @param {} options
	 * @return {any}
	 */
	const formatDateTimeDistance = (date: Date | number, options?: FormatDateOptions) => {
		const now = new Date();
		return formatDistance(date, now, { locale: dateFnsLocale, includeSeconds: true, addSuffix: true, ...options });
	};

	return {
		number: formatNumber,
		percent: formatPercent,
		date: formatDate,
		parseDate,
		intervalDuration: formatIntervalDuration,
		duration: formatDuration,
		dateRange: formatDateRange,
		dateRelative: formatDateRelative,
		dateDistance: formatDateTimeDistance,
		timezone,
	};
};
