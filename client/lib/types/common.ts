/**
 * Localized text type
 * @export
 */
export type LocaleText = { en: string; cs: string };

/**
 * Supported languages
 * @export
 */
export type Language = 'cs' | 'en';
export const LANGUAGES: Record<Language, LocaleText> = {
	cs: {
		cs: 'Čeština',
		en: 'Czech',
	},
	en: {
		cs: 'Angličtina',
		en: 'English',
	},
};

/**
 * User type
 * @export
 */
export type User = {
	_id: string;
	name: string;
	username: string;
	role: USER_ROLE;
};

/**
 * User role enumeration
 * @export
 */
export enum USER_ROLE {
	IOT_DEVICE,
	ADMIN,
	USER,
}
