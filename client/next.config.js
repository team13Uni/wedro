/** @type {import('next').NextConfig} */
module.exports = {
	reactStrictMode: true,
	interpolation: {
		// not needed for react as it escapes by default
		escapeValue: false,
	},
	serializeConfig: false,
	i18n: {
		locales: ['cs', 'en'],
		defaultLocale: 'cs',
		localeDetection: true,
	},
	rewrites() {
		return [
			{ source: '/login', destination: '/auth/login' },
			{ source: '/register', destination: '/auth/register' },
		];
	},
	debug: process.env.NODE_ENV !== 'production' && typeof window !== 'undefined',
};
