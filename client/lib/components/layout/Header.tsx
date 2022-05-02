import { Logout, Translate } from '@mui/icons-material';
import {
	AppBar,
	Avatar,
	Button,
	Container,
	Divider,
	Grid,
	IconButton,
	LinearProgress,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	Toolbar,
	Tooltip,
	Typography,
} from '@mui/material';
import { TRANSLATIONS } from '@wedro/constants';
import { useTranslate } from '@wedro/hooks';
import { isDefined } from '@wedro/utils';
import { NextComponentType } from 'next';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import Router, { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

/**
 * Header component
 * @export
 * @return {JSX.Element}
 * @constructor
 */
export const Header: NextComponentType = () => {
	const { data: session, status } = useSession();
	const [accountMenuAnchorEl, setAccountMenuAnchorEl] = useState<HTMLButtonElement | null>(null);
	const { asPath } = useRouter();
	const { translate, language } = useTranslate();
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	useEffect(() => {
		const onStartLoading = () => setLoading(true);
		const onEndLoading = () => setLoading(false);

		// add event listeners
		Router.events.on('routeChangeStart', onStartLoading);
		Router.events.on('routeChangeComplete', onEndLoading);
		Router.events.on('routeChangeError', onEndLoading);

		// clean up event listeners
		return () => {
			Router.events.off('routeChangeStart', onStartLoading);
			Router.events.off('routeChangeComplete', onEndLoading);
			Router.events.off('routeChangeError', onEndLoading);
		};
	}, []);

	return (
		<>
			<AppBar
				position="sticky"
				color="primary"
				sx={{
					root: {
						boxShadow: 'unset',
						borderBottom: '1px solid #d9d9d9',
					},
				}}
			>
				<Container disableGutters>
					<Toolbar sx={{ display: 'flex', alignItems: 'stretch' }}>
						<Grid container alignItems="center" spacing={2}>
							{/* nav logo */}
							<Grid item>
								<Link href="/">
									<Typography variant="h5" sx={{ fontWeight: 'bold', cursor: 'pointer' }}>
										Wedro
									</Typography>
								</Link>
							</Grid>

							{/* TODO: links for authenticated users */}
							{isDefined(session) && (
								<>
									<Grid item>
										<Link href="/locations">
											<Button variant="text" color="inherit">
												{translate(TRANSLATIONS.LOCATION_LIST.title)}
											</Button>
										</Link>
									</Grid>
								</>
							)}

							{/* language toggle button */}
							<Grid item ml="auto">
								<Link href={asPath} locale={language === 'cs' ? 'en' : 'cs'}>
									<a>
										<Tooltip title={translate(TRANSLATIONS.HEADER.translationToggle)}>
											<IconButton sx={{ color: ({ palette }) => palette.primary.contrastText }}>
												<Translate />
											</IconButton>
										</Tooltip>
									</a>
								</Link>
							</Grid>

							{/* account/login menu */}
							{isDefined(session) ? (
								<Grid item>
									<Tooltip title={translate(TRANSLATIONS.GENERAL.account)}>
										<IconButton onClick={(e) => setAccountMenuAnchorEl(e.currentTarget)} size="small">
											<Avatar
												sx={{
													width: 32,
													height: 32,
													backgroundColor: ({ palette }) => palette.primary.contrastText,
													color: ({ palette }) => palette.primary.main,
													fontSize: '1rem',
													fontWeight: 'bold',
												}}
											>
												{session.account.username[0]}
											</Avatar>
										</IconButton>
									</Tooltip>

									<Menu
										anchorEl={accountMenuAnchorEl}
										open={Boolean(accountMenuAnchorEl)}
										onClose={() => setAccountMenuAnchorEl(null)}
										transformOrigin={{ horizontal: 'right', vertical: 'top' }}
										anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
									>
										<MenuItem disabled>
											{/* TODO */}
											<Link href="/profile">
												<ListItemText primary={session.account.username} secondary={translate(TRANSLATIONS.GENERAL.role[session.account.role])} />
											</Link>
										</MenuItem>
										<Divider />
										<MenuItem
											onClick={async () => {
												await signOut({ redirect: false });
												await router.push('/login');
											}}
										>
											<ListItemIcon>
												<Logout fontSize="small" />
											</ListItemIcon>
											{translate(TRANSLATIONS.GENERAL.logout)}
										</MenuItem>
									</Menu>
								</Grid>
							) : (
								<Grid item>
									<Link href="/login">
										<Button variant="text" color="inherit">
											{translate(TRANSLATIONS.HEADER.login)}
										</Button>
									</Link>
								</Grid>
							)}
						</Grid>
					</Toolbar>
				</Container>
			</AppBar>

			{/* loading bar */}
			<LinearProgress variant="indeterminate" sx={{ opacity: loading ? 1 : 0, transition: 'opacity 250ms' }} />
		</>
	);
};
