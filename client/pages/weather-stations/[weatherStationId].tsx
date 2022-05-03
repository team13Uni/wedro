import { DeviceThermostat, ModeEdit, Thermostat, Timeline, Water } from '@mui/icons-material';
import { DateRangePicker } from '@mui/lab';
import {
	Box,
	Button,
	Card,
	CardContent,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogProps,
	DialogTitle,
	FormGroup,
	Grid,
	Skeleton,
	Stack,
	TextField,
	ToggleButton,
	ToggleButtonGroup,
	Typography,
} from '@mui/material';
import { apiClient } from '@wedro/app';
import { Layout, Map, WeatherStationChart, WeatherStationData, WeatherStationStatusChip } from '@wedro/components';
import { TRANSLATIONS } from '@wedro/constants';
import { useTranslate } from '@wedro/hooks';
import { useFormat } from '@wedro/hooks/useFormat';
import { useNow } from '@wedro/hooks/useNow';
import { Location, NextPageWithAuth, WedroUserRole } from '@wedro/types';
import { isDefined, pickFrom } from '@wedro/utils';
import { subHours } from 'date-fns';
import { GetServerSideProps } from 'next';
import { getSession, useSession } from 'next-auth/react';
import React, { FC, useState } from 'react';
import { Popup } from 'react-mapbox-gl';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
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

	return (
		<Layout title={translate(TRANSLATIONS.WEATHER_STATION_DETAIL.title, { weatherStationName: location.weatherStation.name })}>
			<Container>
				<Box display="flex" alignItems="center" justifyContent="between">
					<div>
						<Typography sx={{ fontSize: 14 }} color="text.secondary">
							{location.name}
						</Typography>
						<Typography variant="h4" component="h1" gutterBottom>
							{translate(TRANSLATIONS.WEATHER_STATION_DETAIL.title, { weatherStationName: location.weatherStation.name })}
						</Typography>
					</div>
					{/* TODO: create button? */}
					{isDefined(session) && session.account.role === WedroUserRole.ADMIN && (
						<Button sx={{ ml: 'auto' }} size="small" startIcon={<ModeEdit />} onClick={() => alert('TODO')}>
							{translate(TRANSLATIONS.GENERAL.edit)}
						</Button>
					)}
				</Box>

				{/* main container */}
				<Stack spacing={2}>
					{/* info container */}
					<Grid container spacing={2}>
						{/* main info */}
						<Grid item xs={12} lg={7}>
							<Card variant="outlined" sx={{ height: '100%' }}>
								<Stack spacing={2} component={CardContent} sx={{ padding: '1rem !important', height: '100%' }} direction="row">
									{/* temperature */}
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
											<Stack direction="row" spacing={2}>
												<DeviceThermostat fontSize="large" />
												<Typography variant="h4" component="div">
													---
												</Typography>
											</Stack>
											{/* mini chart */}
											<Box
												sx={{
													border: (theme) => `1px solid ${theme.palette.divider}`,
													borderRadius: '5px',
													flexGrow: 1,
												}}
											>
												<Skeleton variant="rectangular" height="100%" />
											</Box>
										</Box>
									</Card>

									{/* humidity */}
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
											<Stack direction="row" spacing={2}>
												<Water fontSize="large" />
												<Typography variant="h4" component="div">
													---
												</Typography>
											</Stack>
											{/* mini chart */}
											<Box
												sx={{
													border: (theme) => `1px solid ${theme.palette.divider}`,
													borderRadius: '5px',
													flexGrow: 1,
												}}
											>
												<Skeleton variant="rectangular" height="100%" />
											</Box>
										</Box>
									</Card>
								</Stack>
							</Card>
						</Grid>

						{/* map */}
						<Grid item xs={12} lg={5}>
							<Card variant="outlined">
								<Map
									style="mapbox://styles/mapbox/streets-v9"
									containerStyle={{
										height: '300px',
										width: '100%',
										borderRadius: '5px',
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
							</Card>
						</Grid>
					</Grid>

					{/* main charts */}
					<Grid item xs={12}>
						<WeatherStationCharts weatherStationId={location.weatherStation._id} />
					</Grid>
				</Stack>
			</Container>
		</Layout>
	);
};

// TODO
type PeriodType = 'hour' | 'day' | 'month' | 'year';
type WeatherStationChartProps = { weatherStationId: string };
const WeatherStationCharts: FC<WeatherStationChartProps> = ({ weatherStationId }) => {
	const { translate } = useTranslate();
	const { data: session, status } = useSession();
	const format = useFormat();
	const now = useNow();
	const [currentChart, setCurrentChart] = useState<WeatherStationChart>(WeatherStationChart.TEMPERATURE);
	const [currentPeriod, setCurrentPeriod] = useState<[Date, Date]>([subHours(now, 24), now]);
	const [periodType, setPeriodType] = useState<PeriodType>('hour');
	const [configDialogOpen, setConfigDialogOpen] = useState(false);

	/** get buckets from API */
	const { data, error, isValidating } = useSWR<{ data: WeatherStationData[] }>(
		() =>
			`/api/measurement/${weatherStationId}/buckets?dateFrom=${currentPeriod[0].toISOString()}&dateTo=${currentPeriod[1].toISOString()}&type=${periodType}`,
		(url) =>
			apiClient(
				{
					method: 'GET',
					url,
				},
				session?.accessToken,
			),
	);

	return (
		<React.Fragment>
			<Card variant="outlined">
				<Box
					sx={{
						display: 'flex',
						flexDirection: 'column',
						padding: '1rem !important',
						height: '100%',
						gap: '1rem',
					}}
				>
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'space-between',
							alignItems: 'center',
							border: (theme) => `1px solid ${theme.palette.divider}`,
							borderRadius: '5px',
							padding: '0.5rem 1rem',
						}}
					>
						{/* view toggle button */}
						<ToggleButtonGroup size="small" color="primary" value={currentChart} exclusive onChange={(e, v) => setCurrentChart(v)}>
							<ToggleButton value={WeatherStationChart.TEMPERATURE}>
								<Thermostat fontSize="small" sx={{ mr: 0.5 }} />
								{translate(TRANSLATIONS.GENERAL.temperature)}
							</ToggleButton>
							<ToggleButton value={WeatherStationChart.HUMIDITY}>
								<Water fontSize="small" sx={{ mr: 0.75 }} />
								{translate(TRANSLATIONS.GENERAL.humidity)}
							</ToggleButton>
						</ToggleButtonGroup>

						<Box textAlign="center">
							<Typography variant="h5">Graf v období</Typography>
							<Typography sx={{ fontSize: 14 }} color="colors.secondary">
								{format.date(currentPeriod[0], 'PPp')} - {format.date(currentPeriod[1], 'PPp')}
							</Typography>
						</Box>

						{/* config button */}
						<Button variant="contained" onClick={() => setConfigDialogOpen(true)} startIcon={<Timeline />}>
							Nastavení
						</Button>
					</Box>

					{/* TODO: chart */}
					<Box sx={{ border: (theme) => `1px solid ${theme.palette.divider}`, borderRadius: '5px' }}>
						<ResponsiveContainer width="100%" height={200}>
							{/* FIXME */}
							<AreaChart width={200} height={60} data={data?.data || []}>
								{/* grid */}
								<CartesianGrid stroke="#F5F5F5" />
								{/* FIXME: x axis */}
								<XAxis
									dataKey="date"
									tickFormatter={(v, i) => {
										try {
											return format.date(new Date(v), 'p');
										} catch (e) {
											return '';
										}
									}}
								/>
								{/* tooltip */}
								<Tooltip
									formatter={(value: number, key: keyof WeatherStationData) => {
										switch (key) {
											case 'humidity':
												return [format.percent(value), translate(TRANSLATIONS.GENERAL.humidity)];
											case 'temperature':
												return [
													format.number(value, {
														style: 'unit',
														unit: 'celsius',
													}),
													translate(TRANSLATIONS.GENERAL.temperature),
												];
											default:
												return [null, null];
										}
									}}
									labelFormatter={(date) => {
										try {
											return <span>{format.date(new Date(date), 'Pp')}</span>;
										} catch (e) {
											return '';
										}
									}}
								/>

								{/* charts */}
								{
									{
										[WeatherStationChart.TEMPERATURE]: (
											<Area
												type="monotone"
												dataKey="temperature"
												label={translate(TRANSLATIONS.GENERAL.temperature)}
												strokeWidth={2}
												stroke="#ff7400"
												fill="#f9cb9c"
											/>
										),
										[WeatherStationChart.HUMIDITY]: (
											<Area
												type="monotone"
												dataKey="humidity"
												label={translate(TRANSLATIONS.GENERAL.humidity)}
												strokeWidth={2}
												stroke="#005b96"
												fill="#b3cde0"
											/>
										),
									}[currentChart]
								}
							</AreaChart>
						</ResponsiveContainer>
					</Box>
				</Box>
			</Card>

			{/* period config dialog */}
			<WeatherStationChartsConfigDialog
				open={configDialogOpen}
				onClose={() => setConfigDialogOpen(false)}
				values={{
					dateFrom: currentPeriod[0],
					dateTo: currentPeriod[1],
					type: periodType,
				}}
				setValues={(newValues) => {
					setCurrentPeriod([newValues.dateFrom, newValues.dateTo]);
					setPeriodType(newValues.type);
				}}
			/>
		</React.Fragment>
	);
};

// TODO: move
type WeatherStationChartsConfigDialogValues = {
	dateFrom: Date;
	dateTo: Date;
	type: PeriodType;
};
type WeatherStationChartsConfigDialogProps = {
	values: WeatherStationChartsConfigDialogValues;
	setValues: (values: WeatherStationChartsConfigDialogValues) => void;
} & DialogProps;
const WeatherStationChartsConfigDialog: FC<WeatherStationChartsConfigDialogProps> = ({ values: inputValues, setValues, ...props }) => {
	const [dateFrom, setDateFrom] = useState<Date>(inputValues.dateFrom);
	const [dateTo, setDateTo] = useState<Date>(inputValues.dateTo);
	const [type, setType] = useState<PeriodType>(inputValues.type);

	return (
		<Dialog {...props}>
			<DialogTitle>Nastavení grafů</DialogTitle>
			<DialogContent>
				<Stack spacing={2}>
					<DialogContentText>
						Lorem ipsum dolor sit amet, consectetur adipisicing elit. A animi assumenda cupiditate deserunt ea eum illum iusto neque quasi, quibusdam
						quos recusandae reiciendis repudiandae sapiente suscipit tempore unde voluptate voluptates.
					</DialogContentText>

					{/* date range */}
					<FormGroup>
						<DateRangePicker
							startText="Od"
							endText="Do"
							disableFuture
							value={[dateFrom, dateTo]}
							onChange={(newValue) => {
								if (isDefined(newValue[0])) setDateFrom(newValue[0]);
								if (isDefined(newValue[1])) setDateTo(newValue[1]);
							}}
							renderInput={(startProps, endProps) => (
								<React.Fragment>
									<TextField sx={{ flexGrow: 1 }} {...startProps} />
									<Box sx={{ mx: 2 }}> – </Box>
									<TextField sx={{ flexGrow: 1 }} {...endProps} />
								</React.Fragment>
							)}
						/>
					</FormGroup>

					{/*	type */}
					<FormGroup>
						<Typography sx={{ fontSize: 14, fontWeight: 'bold', mb: 1 }} color="text.secondary" component="label">
							Granularita
						</Typography>
						<ToggleButtonGroup color="primary" value={type} exclusive onChange={(e, v) => setType(v)}>
							{(['hour', 'day', 'month', 'year'] as PeriodType[]).map((value) => (
								<ToggleButton sx={{ flexGrow: 1 }} value={value}>
									{value}
								</ToggleButton>
							))}
						</ToggleButtonGroup>
					</FormGroup>
				</Stack>
			</DialogContent>
			<DialogActions>
				<Button onClick={(e) => props.onClose?.(e, 'escapeKeyDown')}>Cancel</Button>
				<Button
					onClick={(e) => {
						setValues({ dateFrom, dateTo, type });
						props.onClose?.(e, 'escapeKeyDown');
					}}
				>
					Confirm
				</Button>
			</DialogActions>
		</Dialog>
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

/** page auth guarding */
WeatherStationDetailPage.requiresAuth = true;
WeatherStationDetailPage.denyLogged = false;

/**
 * Page default export
 * @default
 */
export default WeatherStationDetailPage;
