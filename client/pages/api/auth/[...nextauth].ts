import { apiClient, APIClientError } from '@wedro/app';
import { IS_DEVELOPMENT } from '@wedro/constants';
import { isDefined } from '@wedro/utils';
import jwt_decode from 'jwt-decode';
import { NextApiRequest, NextApiResponse } from 'next';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

/**
 * NextAuth API config
 * @default
 */
export default (req: NextApiRequest, res: NextApiResponse) =>
	NextAuth(req, res, {
		providers: [
			CredentialsProvider({
				name: 'Credentials',
				credentials: { username: {}, password: {} } as any,
				authorize: async (credentials) => {
					if (!isDefined(credentials)) throw new APIClientError('missing_credentials', 'Credentials are missing', 500);

					// call API to login via credentials
					const { data: loginRes } = await apiClient({
						url: '/api/auth/login',
						data: {
							password: credentials.password,
							username: credentials.username,
						},
						method: 'POST',
					});

					// check if login was successful
					if (isDefined(loginRes.accessToken)) {
						const user = jwt_decode<Record<string, string | undefined>>(loginRes.accessToken);
						return {
							accessToken: loginRes.accessToken,
							account: user,
						};
					} else throw new APIClientError('empty_access_token', 'Access token was empty.', 500);
				},
			}),
		],
		pages: {
			signIn: '/login',
		},
		callbacks: {
			async jwt({ token, user }) {
				token.accessToken = user?.accessToken || token.accessToken;
				token.account = user?.account || token.account;
				return token;
			},
			async session({ session, token }) {
				session.accessToken = token.accessToken;
				session.account = token.account;
				return session;
			},
		},
		debug: IS_DEVELOPMENT,
		secret: 'wedro-rules-96',
	});
