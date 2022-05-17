import { DeviceThermostat, ModeEdit, Water } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Container, Grid, Stack, Typography } from '@mui/material';
import { apiClient } from '@wedro/app';
import { Layout, Map, StatCard, WeatherStationCharts, WeatherStationData, WeatherStationStatusChip } from '@wedro/components';
import { TRANSLATIONS } from '@wedro/constants';
import { useTranslate } from '@wedro/hooks';
import { useFormat } from '@wedro/hooks/useFormat';
import { useNow } from '@wedro/hooks/useNow';
import { Location, NextPageWithAuth, WedroUserRole } from '@wedro/types';
import { isDefined, pickFrom } from '@wedro/utils';
import { GetServerSideProps } from 'next';
import { getSession, useSession } from 'next-auth/react';
import React, { useMemo } from 'react';
import { Popup } from 'react-mapbox-gl';
import { Bar, BarChart, ResponsiveContainer, Tooltip } from 'recharts';
import useSWR from 'swr';

/**
 * Weather station detail page
 * @constructor
 */
const WeatherStationDetailPage: NextPageWithAuth<WeatherStationDetailPageProps> = ({ location }) => {
	const { translate } = useTranslate();
	const { data: session, status } = useSession();
	const format = useFormat();
	const now = useNow();

	/** get current data from API */
	const {
		data: currentData,
		error,
		isValidating,
	} = useSWR<{ data: WeatherStationCurrentData }>(
		() => `/api/measurement/${location.weatherStation._id}/current`,
		(url) =>
			apiClient(
				{
					method: 'GET',
					url,
				},
				session?.accessToken,
			),
	);

	/** perform stats calculation and memoize the result */
	const { highestTemp, lowestTemp, current, lowestHum, highestHum } = useMemo(() => {
		const buckets = currentData?.data;

		/** return nulls if no data yet */
		if (!isDefined(buckets)) {
			return {
				highestTemp: null,
				lowestTemp: null,
				highestHum: null,
				lowestHum: null,
				current: null,
			};
		}

		/** calculate stats */
		const tops = buckets.todayBuckets.reduce<{
			highestTemp: WeatherStationData | null;
			lowestTemp: WeatherStationData | null;
			highestHum: WeatherStationData | null;
			lowestHum: WeatherStationData | null;
		}>(
			(acc, bucket) => {
				for (const _key of Object.keys(acc)) {
					const key = _key as keyof typeof acc;

					switch (key) {
						case 'lowestHum':
							if (!isDefined(bucket.humidity)) break;
							if (!isDefined(acc[key])) acc[key] = bucket;
							else if (bucket.humidity < acc[key]!.humidity) acc[key] = bucket;
							break;
						case 'highestHum':
							if (!isDefined(bucket.humidity)) break;
							if (!isDefined(acc[key])) acc[key] = bucket;
							if (bucket.humidity > acc[key]!.humidity) acc[key] = bucket;
							break;
						case 'lowestTemp':
							if (!isDefined(bucket.temperature)) break;
							if (!isDefined(acc[key])) acc[key] = bucket;
							if (bucket.temperature < acc[key]!.temperature) acc[key] = bucket;
							break;
						case 'highestTemp': {
							if (!isDefined(bucket.temperature)) break;
							if (!isDefined(acc[key])) acc[key] = bucket;
							if (bucket.temperature > acc[key]!.temperature) acc[key] = bucket;
							break;
						}
					}
				}
				return acc;
			},
			{
				highestTemp: null,
				lowestTemp: null,
				highestHum: null,
				lowestHum: null,
			},
		);

		return {
			current: pickFrom(buckets, 'temperature', 'humidity', 'date'),
			...tops,
		};
	}, [currentData]);

	return (
		<Layout title={translate(TRANSLATIONS.WEATHER_STATION_DETAIL.title, { weatherStationName: location.weatherStation.name })}>
			{/* map header */}
			<Box sx={{ position: 'relative' }}>
				<Map
					style="mapbox://styles/mapbox/streets-v9"
					containerStyle={{
						height: '400px',
						width: '100%',
					}}
					center={location.weatherStation.coordinates}
					zoom={[15]}
				>
					<Popup coordinates={location.weatherStation.coordinates}>
						{/* station name */}
						<Typography color="text.primary" sx={{ fontWeight: 'bold' }}>
							{location.weatherStation.name}
						</Typography>
						{/* sea level */}
						<Typography sx={{ fontSize: 14 }} color="text.secondary" mb={2}>
							{translate(TRANSLATIONS.GENERAL.seaLevel, {
								seaLevel: location.weatherStation.seaLevel,
							})}
						</Typography>
						{/* status */}
						<WeatherStationStatusChip size="small" {...pickFrom(location.weatherStation, 'unavailable', 'lastActiveAt')} />
					</Popup>
				</Map>
				<Box
					sx={{
						position: 'absolute',
						background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%,rgba(255,255,255,1) 100%);',
						bottom: 0,
						left: 0,
						right: 0,
						height: '200px',
					}}
				/>
			</Box>

			{/* main container */}
			<Container
				sx={{
					minHeight: '60vh' /* ol' magic number */,
					py: 3,
					display: 'flex',
					flexDirection: 'column',
				}}
			>
				<Box display="flex" alignItems="center" justifyContent="between">
					<div>
						<Typography sx={{ fontSize: 14 }} color="text.secondary">
							{location.name}
						</Typography>
						<Typography variant="h4" component="h1" gutterBottom>
							{translate(TRANSLATIONS.WEATHER_STATION_DETAIL.title, { weatherStationName: location.weatherStation.name })}
						</Typography>
					</div>
					{/* TODO: edit button */}
					{isDefined(session) && session.account.role === WedroUserRole.ADMIN && (
						<Button sx={{ ml: 'auto' }} size="small" startIcon={<ModeEdit />} onClick={() => alert('TODO')}>
							{translate(TRANSLATIONS.GENERAL.edit)}
						</Button>
					)}
				</Box>

				{/* main container */}
				<Stack spacing={2} sx={{ flexGrow: 1 }}>
					{/* info container */}
					<Card variant="outlined" sx={{ height: '100%' }}>
						<Grid container spacing={2} component={CardContent} sx={{ padding: '1rem !important', height: '100%' }}>
							{/* temperature */}
							<Grid item xs={12} lg={6} sx={{ display: 'flex' }}>
								<Card variant="outlined" sx={{ flexGrow: 1 }}>
									<Box
										sx={{
											display: 'flex',
											flexDirection: 'column',
											padding: '1rem !important',
											height: '100%',
											gap: '0.5rem',
										}}
									>
										{/* heading */}
										<Typography sx={{ fontSize: 14 }} color="text.secondary">
											{translate(TRANSLATIONS.WEATHER_STATION_CARD.currentTemperature)}
										</Typography>
										{/* info */}
										<StatCard
											icon={<DeviceThermostat fontSize="large" />}
											data={
												isDefined(current?.temperature)
													? {
															date: current!.date,
															value: current!.temperature,
													  }
													: undefined
											}
											min={
												isDefined(lowestTemp)
													? {
															date: lowestTemp.date,
															value: lowestTemp.temperature,
													  }
													: undefined
											}
											max={
												isDefined(highestTemp)
													? {
															date: highestTemp.date,
															value: highestTemp.temperature,
													  }
													: undefined
											}
											formatter={(v) => format.number(v, { style: 'unit', unit: 'celsius' })}
										/>
										{/* mini chart */}
										<Box
											sx={{
												flexGrow: 1,
												minHeight: '100px',
											}}
										>
											<ResponsiveContainer width="100%" height="100%">
												<BarChart
													data={
														currentData?.data.todayBuckets.map((bucket) => ({
															...bucket,
															temperature: bucket.temperature ?? 0,
														})) || []
													}
												>
													<Tooltip
														formatter={(value: number) => [
															/** LOL: hope temperature won't possibly hit 0 rn */
															isNaN(value) || value === 0
																? translate(TRANSLATIONS.GENERAL.notAvailable)
																: format.number(value, {
																		style: 'unit',
																		unit: 'celsius',
																  }),
															translate(TRANSLATIONS.GENERAL.temperature),
														]}
														labelFormatter={(date, payload) => {
															try {
																return <small>{format.date(new Date(payload[0].payload.date), 'Pp')}</small>;
															} catch (e) {
																return '';
															}
														}}
													/>
													<Bar dataKey="temperature" fill="#c692ff" minPointSize={1} />
												</BarChart>
											</ResponsiveContainer>
										</Box>
									</Box>
								</Card>
							</Grid>

							{/* humidity */}
							<Grid item xs={12} lg={6} sx={{ display: 'flex' }}>
								<Card variant="outlined" sx={{ flexGrow: 1 }}>
									<Box
										sx={{
											display: 'flex',
											flexDirection: 'column',
											padding: '1rem !important',
											height: '100%',
											gap: '0.5rem',
										}}
									>
										{/* heading */}
										<Typography sx={{ fontSize: 14 }} color="text.secondary">
											{translate(TRANSLATIONS.WEATHER_STATION_CARD.currentHumidity)}
										</Typography>
										{/* info */}
										<StatCard
											icon={<Water fontSize="large" />}
											data={
												isDefined(current?.humidity)
													? {
															date: current!.date,
															value: current!.humidity,
													  }
													: undefined
											}
											min={isDefined(lowestHum) ? { date: lowestHum.date, value: lowestHum.humidity } : undefined}
											max={
												isDefined(highestHum)
													? {
															date: highestHum.date,
															value: highestHum.humidity,
													  }
													: undefined
											}
											formatter={format.percent}
										/>
										{/* mini chart */}
										<Box
											sx={{
												flexGrow: 1,
												minHeight: '100px',
											}}
										>
											<ResponsiveContainer width="100%" height="100%">
												<BarChart
													data={
														currentData?.data.todayBuckets.map((bucket) => ({
															...bucket,
															humidity: bucket.humidity ?? 0,
														})) || []
													}
												>
													<Tooltip
														formatter={(value: number) => [
															/** LOL: hope humidity won't possibly hit 0 rn */
															isNaN(value) || value === 0 ? translate(TRANSLATIONS.GENERAL.notAvailable) : format.percent(value),
															translate(TRANSLATIONS.GENERAL.humidity),
														]}
														labelFormatter={(date, payload) => {
															try {
																return <small>{format.date(new Date(payload[0].payload.date), 'Pp')}</small>;
															} catch (e) {
																return '';
															}
														}}
													/>
													<Bar dataKey="humidity" fill="#c692ff" minPointSize={1} />
												</BarChart>
											</ResponsiveContainer>
										</Box>
									</Box>
								</Card>
							</Grid>
						</Grid>
					</Card>

					{/* main charts */}
					<Grid item xs={12} sx={{ '&.MuiGrid-root': { flexGrow: '1 !important', display: 'flex !important' } }}>
						<WeatherStationCharts weatherStationId={location.weatherStation._id} />
					</Grid>
				</Stack>
			</Container>
		</Layout>
	);
};

/**
 * Weather station detail page props
 */
export const getServerSideProps: GetServerSideProps<WeatherStationDetailPageProps, { weatherStationId: string }> = async (context) => {
	try {
		const session = await getSession(context);
		const { data } = await apiClient(
			{
				url: `/api/location/${context.params?.weatherStationId}`,
				method: 'GET',
			},
			session?.accessToken,
		);

		console.log('[weather-station-detail][debug] Loaded props', data);
		return { props: { location: data } };
	} catch (error) {
		console.log('[weather-station-detail][debug] Failed to load serverSideProps', error);
		return {
			redirect: {
				destination: '/weather-stations',
				statusCode: 302,
			},
		};
	}
};

/**
 * Weather station detail page props type
 * @export
 */
export type WeatherStationDetailPageProps = {
	location: Location;
};

/**
 * Weather station current data type
 * @private
 */
type WeatherStationCurrentData = {
	date: string;
	temperature: number | null;
	humidity: number | null;
	todayBuckets: WeatherStationData[];
};

/** page auth guarding */
WeatherStationDetailPage.requiresAuth = true;
WeatherStationDetailPage.denyLogged = false;

/**
 * Page default export
 * @default
 */
export default WeatherStationDetailPage;
