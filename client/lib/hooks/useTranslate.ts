import { Language, LocaleText } from '@wedro/types';
import { isDefined } from '@wedro/utils';
import { useRouter } from 'next/router';

/**
 * Very basic translation hook
 */
export const useTranslate = () => {
	const { locale } = useRouter();
	const language = getLanguageFromLocale(locale);

	const translate = <T extends BaseTranslate = BaseTranslate>(
		translations: T | string,
		values?: { [key: string]: string | number | BaseTranslate },
	): string => {
		if (typeof translations === 'string') return interpolate(translations, values);
		return interpolate(translations[language], values);
	};

	const interpolate = (text: string, values?: { [key: string]: string | number | BaseTranslate }) => {
		if (!isDefined(values)) return text;
		return text.replace(/{([^}]+)}/g, (_, key) => {
			key = typeof key === 'string' ? key.replace(/\s/g, '') : key;
			if (typeof values[key] === 'object') return translate(values[key] as BaseTranslate);
			return `${values[key]}` || '';
		});
	};

	return {
		translate,
		language,
	};
};

/**
 * Returns language from provided locale string
 * @param locale
 */
export const getLanguageFromLocale = (locale: string | undefined): Language => {
	if (locale === 'en') return 'en';
	// default language is 'cs'
	return 'cs';
};

export type BaseTranslate = LocaleText;
