import { CircularProgress, Container } from '@mui/material';
import { Layout } from '@wedro/components/layout/Layout';
import { TRANSLATIONS } from '@wedro/constants';
import { useTranslate } from '@wedro/hooks';
import { isDefined } from '@wedro/utils';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { FunctionComponent, useEffect } from 'react';

/**
 * Props for AuthGuard component
 */
export type AuthGuardProps = { requiresAuth?: boolean; denyLogged?: boolean };

/**
 * TODO: guard for `canAccess` case
 * AuthGuard component
 * @constructor
 */
export const AuthGuard: FunctionComponent<AuthGuardProps> = ({ children, requiresAuth, denyLogged }) => {
	const { data: session, status } = useSession();
	const router = useRouter();
	const { translate } = useTranslate();

	useEffect(() => {
		if (status === 'loading') {
			console.log('[AuthGuard][debug] loading', { session, status });
			return;
		}

		// redirect if session and denyLogged are defined
		if (isDefined(session) && denyLogged) {
			console.log('[AuthGuard][debug] session + denyLogged', { session, status });
			router.push('/');
			return;
		}

		// redirect if session is not defined but is required
		if (!isDefined(session) && requiresAuth) {
			console.log('[AuthGuard][debug] !session + requiredAuth: REDIRECT', { session, status });
			router.push('/login');
			return;
		}
	}, [status, session, requiresAuth, denyLogged]);

	// show loading overlay
	if (status === 'loading') {
		return (
			<Layout title={translate(TRANSLATIONS.LOADER.title)}>
				<Container
					sx={{
						flexGrow: 1,
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					<CircularProgress />
				</Container>
			</Layout>
		);
	}

	// early null return if session and denyLogged are defined
	if (isDefined(session) && denyLogged) return null;

	// early null return if session is not defined but is required
	if (!isDefined(session) && requiresAuth) return null;

	// return authenticated children
	return <>{children}</>;
};
