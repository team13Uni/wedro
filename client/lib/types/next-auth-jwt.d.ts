import { Session } from 'next-auth';

declare module 'next-auth/jwt' {
	/** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
	interface JWT extends Pick<Session, 'accessToken' | 'account'> {
		name?: never;
		username?: never;
		picture?: never;
		sub?: never;
	}
}
