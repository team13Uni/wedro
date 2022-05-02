import { ModeEdit } from '@mui/icons-material';
import { Box, Button, Container, Grid, Typography } from '@mui/material';
import { apiClient } from '@wedro/app';
import { Layout, WeatherStationCard } from '@wedro/components';
import { TRANSLATIONS } from '@wedro/constants';
import { useTranslate } from '@wedro/hooks';
import { Location, NextPageWithAuth, WedroUserRole } from '@wedro/types';
import { isDefined } from '@wedro/utils';
import { GetServerSideProps } from 'next';
import { getSession, useSession } from 'next-auth/react';
import React from 'react';

/**
 * Locations page
 * @constructor
 */
const LocationsPage: NextPageWithAuth<LocationsPageProps> = ({ locations }) => {
	const { translate } = useTranslate();
	const { data: session, status } = useSession();

	return (
		<Layout title={translate(TRANSLATIONS.LOCATION_LIST.title)}>
			<Container>
				<Box display="flex" alignItems="center" justifyContent="between">
					<Typography variant="h4" component="h1" gutterBottom>
						{translate(TRANSLATIONS.LOCATION_LIST.title)}
					</Typography>
					{/* TODO: create button? */}
					{isDefined(session) && session.account.role === WedroUserRole.ADMIN && (
						<Button sx={{ ml: 'auto' }} size="small" startIcon={<ModeEdit />} onClick={() => alert('TODO')}>
							{translate(TRANSLATIONS.GENERAL.create)}
						</Button>
					)}
				</Box>

				<Grid container spacing={3}>
					{locations.map((location, key) => {
						return (
							<Grid item xs={12} lg={6} key={location._id}>
								<WeatherStationCard location={location} />
							</Grid>
						);
					})}
				</Grid>
			</Container>
		</Layout>
	);
};

/**
 * Locations page props
 */
export const getServerSideProps: GetServerSideProps = async (context) => {
	try {
		const session = await getSession(context);
		const { data } = await apiClient({ url: '/api/location', method: 'GET' }, session?.accessToken);

		console.log('[locations][debug] Loaded props', data);
		return { props: { locations: data } };
	} catch (error) {
		console.log('[locations][debug] Failed to load serverSideProps', error);
		return {
			redirect: {
				destination: '/',
				statusCode: 302,
			},
		};
	}
};

/**
 * Locations page props type
 * @export
 */
export type LocationsPageProps = {
	locations: Location[];
};

/** page auth guarding */
LocationsPage.requiresAuth = true;
LocationsPage.denyLogged = false;

/**
 * Page default export
 * @default
 */
export default LocationsPage;
