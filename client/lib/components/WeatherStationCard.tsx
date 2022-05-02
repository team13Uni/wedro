import {
	ArrowDownward,
	ArrowRightAlt,
	ArrowUpward,
	CellWifi,
	DeviceThermostat,
	SignalWifiStatusbarConnectedNoInternet4,
	Thermostat,
	Water,
} from '@mui/icons-material';
import {
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	Chip,
	Divider,
	Stack,
	ToggleButton,
	ToggleButtonGroup,
	Tooltip as MuiTooltip,
	Typography,
} from '@mui/material';
import { apiClient } from '@wedro/app';
import { TRANSLATIONS } from '@wedro/constants';
import { useTranslate } from '@wedro/hooks';
import { useFormat } from '@wedro/hooks/useFormat';
import { useNow } from '@wedro/hooks/useNow';
import { Location } from '@wedro/types';
import { isDefined } from '@wedro/utils';
import { subHours } from 'date-fns';
import { useSession } from 'next-auth/react';
import React, { FC, useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import useSWR from 'swr';

/**
 * WeatherStationCard component
 * @author filipditrich
 * @returns {JSX.Element}
 * @constructor
 */
export const WeatherStationCard: FC<WeatherStationCardProps> = ({ location }) => {
	const { translate } = useTranslate();
	const format = useFormat();
	const { data: session } = useSession();
	const now = useNow();
	const [currentChart, setCurrentChart] = useState<WeatherStationChart>(WeatherStationChart.TEMPERATURE);

	/** get buckets from API */
	const { data, error, isValidating } = useSWR<{ data: WeatherStationData[] }>(
		() => `/api/measurement/${location.weatherStation._id}/buckets?dateFrom=${subHours(now, 24).toISOString()}&dateTo=${now.toISOString()}&type=hour`,
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
	const { highestTemp, lowestTemp, currentTemp, currentHum } = useMemo(() => {
		const buckets = data?.data;

		/** return nulls if no data yet */
		if (!isDefined(buckets)) {
			return {
				highestTemp: null,
				lowestTemp: null,
				currentTemp: null,
				currentHum: null,
			};
		}

		const highestTemp = Math.max(...buckets.map((bucket) => bucket.temperature));
		const lowestTemp = Math.min(...buckets.map((bucket) => bucket.temperature));
		const currentTemp = buckets[buckets.length - 1].temperature;
		const currentHum = buckets[buckets.length - 1].humidity;

		return {
			highestTemp,
			lowestTemp,
			currentTemp,
			currentHum,
		};
	}, [data]);

	return (
		<Card variant="outlined">
			<CardContent>
				<Stack sx={{ w: '100%' }} spacing={2} direction="row" justifyContent="space-between" alignItems="center">
					<div>
						<Typography sx={{ fontSize: 14 }} color="text.secondary">
							{location.name}
						</Typography>
						<Typography variant="h5" gutterBottom>
							{location.weatherStation.name}
						</Typography>
						<Box mb={1.5}>
							{!location.weatherStation.unavailable ? (
								<Chip color="success" label="Dostupná" icon={<CellWifi />} />
							) : (
								// TODO: i18n
								<MuiTooltip title={`Naposledy dostupná ${format.date(new Date(location.weatherStation.lastActiveAt), 'PPPp')}`}>
									<Chip color="warning" label="Nedostupná" icon={<SignalWifiStatusbarConnectedNoInternet4 />} />
								</MuiTooltip>
							)}
						</Box>
					</div>

					{/* TODO: detail button */}
					<Button color="primary" endIcon={<ArrowRightAlt />} disabled>
						{translate(TRANSLATIONS.GENERAL.open)}
					</Button>
				</Stack>

				{/* current stats card stack */}
				<Stack direction="row" spacing={2} mb={3}>
					{/* temperature */}
					<Card variant="outlined" sx={{ flexGrow: 1 }}>
						<CardContent>
							<Typography sx={{ fontSize: 14 }} color="text.secondary" mb={2}>
								{translate(TRANSLATIONS.WEATHER_STATION_CARD.currentTemperature)}
							</Typography>
							<Stack direction="row" spacing={2}>
								<DeviceThermostat fontSize="large" />
								<Typography variant="h4" component="div">
									{isDefined(currentTemp)
										? format.number(currentTemp, {
												style: 'unit',
												unit: 'celsius',
										  })
										: '---'}
								</Typography>
							</Stack>
						</CardContent>
					</Card>

					{/* humidity */}
					<Card variant="outlined" sx={{ flexGrow: 1 }}>
						<CardContent>
							<Typography sx={{ fontSize: 14 }} color="text.secondary" mb={2}>
								{translate(TRANSLATIONS.WEATHER_STATION_CARD.currentHumidity)}
							</Typography>
							<Stack direction="row" spacing={2}>
								<Water fontSize="large" />
								<Typography variant="h4" component="div">
									{isDefined(currentHum) ? format.percent(currentHum) : '---'}
								</Typography>
							</Stack>
						</CardContent>
					</Card>

					{/* highs/lows */}
					<Card variant="outlined" sx={{ flexGrow: 1 }}>
						<CardContent>
							<Typography sx={{ fontSize: 14 }} color="text.secondary" mb={2}>
								{translate(TRANSLATIONS.WEATHER_STATION_CARD.dayHighsLows)}
							</Typography>
							<Stack direction="row" spacing={2}>
								<div>
									<ArrowUpward fontSize="small" />
									<Typography variant="h5" component="span">
										{isDefined(highestTemp)
											? format.number(highestTemp, {
													style: 'unit',
													unit: 'celsius',
											  })
											: '---'}
									</Typography>
								</div>
								<Divider orientation="vertical" flexItem />
								<div>
									<ArrowDownward fontSize="small" />
									<Typography variant="h5" component="span">
										{isDefined(lowestTemp)
											? format.number(lowestTemp, {
													style: 'unit',
													unit: 'celsius',
											  })
											: '---'}
									</Typography>
								</div>
							</Stack>
						</CardContent>
					</Card>
				</Stack>

				{/* last 24 hours charts */}
				<Card variant="outlined">
					<CardContent>
						<CardActions sx={{ marginBottom: 2 }}>
							<ToggleButtonGroup
								sx={{ margin: 'auto' }}
								size="small"
								color="primary"
								value={currentChart}
								exclusive
								onChange={(e, v) => setCurrentChart(v)}
							>
								<ToggleButton value={WeatherStationChart.TEMPERATURE}>
									<Thermostat fontSize="small" sx={{ mr: 0.5 }} />
									{translate(TRANSLATIONS.GENERAL.temperature)}
								</ToggleButton>
								<ToggleButton value={WeatherStationChart.HUMIDITY}>
									<Water fontSize="small" sx={{ mr: 0.75 }} />
									{translate(TRANSLATIONS.GENERAL.humidity)}
								</ToggleButton>
							</ToggleButtonGroup>
						</CardActions>

						{/* chart container */}
						<ResponsiveContainer width="100%" height={200}>
							<AreaChart width={200} height={60} data={data?.data || []}>
								{/* grid */}
								<CartesianGrid stroke="#F5F5F5" />
								{/* FIXME: x axis */}
								<XAxis dataKey="date" tickFormatter={(v, i) => format.date(new Date(v), 'p')} />
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
									labelFormatter={(date) => <span>{format.date(new Date(date), 'Pp')}</span>}
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
					</CardContent>
				</Card>
			</CardContent>
		</Card>
	);
};

/**
 * WeatherStationCard component props type
 * @private
 */
type WeatherStationCardProps = {
	location: Location;
};

/**
 * WeatherStationCard component data type
 * @private
 */
type WeatherStationData = {
	date: Date;
	temperature: number;
	humidity: number;
};

/**
 * WeatherStationCard component chart enumeration
 * @private
 */
enum WeatherStationChart {
	TEMPERATURE,
	HUMIDITY,
}
