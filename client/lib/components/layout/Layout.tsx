import { Box, Paper, PaperProps } from '@mui/material';
import { BackdropOverlay } from '@wedro/components';
import { isDefined, isEmpty } from '@wedro/utils';
import { NextComponentType } from 'next';
import Head from 'next/head';
import React from 'react';
import { Footer } from './Footer';
import { Header } from './Header';

/**
 * Main Layout component
 * @return {JSX.Element}
 * @constructor
 */
export const Layout: React.FC<LayoutProps> = ({
	title,
	description = 'Wedro application',
	keywords = 'Wedro, BIOT22SST06',
	type = 'website',
	url = '/',
	image = '/wedro_logo.svg',
	origin = '',
	CustomHeader,
	CustomFooter,
	disableHeader,
	disableFooter,
	children,
	isLoading,
	...PaperProps
}) => {
	return (
		<Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
			<Head>
				<meta charSet="utf-8" />
				<title>{isEmpty(title) ? 'Wedro' : `${title} | Wedro`}</title>

				{/* basic SEO meta tags */}
				<meta name="robots" content="index, follow" />
				<meta name="description" content={description} />
				<meta name="keywords" content={keywords} />
				{/* twitter meta tags */}
				<meta property="twitter:image:src" content={`${origin}${image}?v=${Math.floor(Date.now() / 100)}`} />
				<meta property="twitter:card" content="summary" />
				<meta property="twitter:url" content={url} />
				<meta property="twitter:title" content={title} />
				<meta property="twitter:description" content={description} />

				{/* og meta tags */}
				<meta property="og:image" content={`${origin}${image}?v=${Math.floor(Date.now() / 100)}`} />
				<meta property="og:site_name" content={url} />
				<meta property="og:type" content={type} />
				<meta property="og:title" content={title} />
				<meta property="og:url" content={url} />
				<meta property="og:description" content={description} />
			</Head>
			{/* layout header */}
			{!disableHeader && (isDefined(CustomHeader) ? <CustomHeader /> : <Header />)}
			{/* layout content - body */}
			<Paper
				{...PaperProps}
				sx={{
					flexGrow: 1,
					display: 'flex',
					flexDirection: 'column',
					borderRadius: '0',
					py: ({ spacing }) => spacing(2),
					...PaperProps.sx,
				}}
			>
				<BackdropOverlay open={isLoading || false}>{children}</BackdropOverlay>
			</Paper>
			{/* layout footer */}
			{!disableFooter && (isDefined(CustomFooter) ? <CustomFooter /> : <Footer />)}
		</Box>
	);
};

/**
 * Layout component props
 */
export type LayoutProps = {
	title: string;
	description?: string;
	keywords?: string;
	type?: string;
	url?: string;
	image?: string;
	origin?: string;
	CustomHeader?: NextComponentType;
	CustomFooter?: NextComponentType;
	disableHeader?: boolean;
	disableFooter?: boolean;
	isLoading?: boolean;
} & PaperProps;
