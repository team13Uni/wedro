import { CacheProvider, EmotionCache } from '@emotion/react';
import { LocalizationProvider } from '@mui/lab';
import DateFnsAdapter from '@mui/lab/AdapterDateFns';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { createEmotionCache, theme } from '@wedro/app';
import { AuthGuard } from '@wedro/components';
import { NextPageWithAuth } from '@wedro/types';
import { pickFrom } from '@wedro/utils';
import { SessionProvider } from 'next-auth/react';
import { AppProps } from 'next/app';
import Head from 'next/head';
import * as React from 'react';
import { FunctionComponent } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';

// client-side cache, shared for the whole session of the user in the browser
const clientSideEmotionCache = createEmotionCache();

/**
 * Custom _app implementation
 * @constructor
 */
const CustomApp: FunctionComponent<CustomAppProps> = (props) => {
	const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

	return (
		<LocalizationProvider dateAdapter={DateFnsAdapter}>
			<CacheProvider value={emotionCache}>
				<Head>
					<title>Wedro</title>
					<meta name="viewport" content="initial-scale=1, width=device-width" />
				</Head>
				<ThemeProvider theme={theme}>
					<CssBaseline />
					<SessionProvider session={props.pageProps.session}>
						<AuthGuard {...pickFrom(Component, 'denyLogged', 'requiresAuth')}>
							<Component {...pageProps} />
						</AuthGuard>
					</SessionProvider>
				</ThemeProvider>
			</CacheProvider>
		</LocalizationProvider>
	);
};

/**
 * CustomApp props
 */
export type CustomAppProps = Omit<AppProps, 'Component'> & {
	emotionCache?: EmotionCache;
	Component: NextPageWithAuth;
};

/**
 * CustomApp export
 */
export default CustomApp;
