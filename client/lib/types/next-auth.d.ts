import { User as WedroUser } from './entities';

export declare module 'next-auth' {
	/**
	 * Returned by `useSession`, `getSession` and received as a prop on the `Provider` React Context
	 */
	interface Session {
		account: User['account'];
		accessToken: string;
	}

	/**
	 * The shape of the user object returned to the OAuth providers' `profile` callback,
	 * or the second parameter of the `session` callback, when using a database.
	 */
	interface User {
		accessToken: string;
		account: {
			id: string;
		} & Pick<WedroUser, 'username' | 'role' | 'name'>;
		image?: never;
		name?: never;
		username?: never;
	}
}
