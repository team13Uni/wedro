import { ArrowRightAlt, DeviceThermostat, Water } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Stack, Typography } from '@mui/material';
import { apiClient } from '@wedro/app';
import { WeatherStationStatusChip } from '@wedro/components/WeatherStationStatusChip';
import { TRANSLATIONS } from '@wedro/constants';
import { useTranslate } from '@wedro/hooks';
import { useFormat } from '@wedro/hooks/useFormat';
import { useNow } from '@wedro/hooks/useNow';
import { Location } from '@wedro/types';
import { isDefined, pickFrom } from '@wedro/utils';
import { subHours } from 'date-fns';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import React, { FC, useMemo, useState } from 'react';
import { Area, Bar, CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip } from 'recharts';
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
							<WeatherStationStatusChip {...pickFrom(location.weatherStation, 'unavailable', 'lastActiveAt')} />
						</Box>
					</div>

					{/* detail button */}
					<Link href={`/weather-stations/${location._id}`}>
						<Button color="primary" endIcon={<ArrowRightAlt />}>
							{translate(TRANSLATIONS.GENERAL.open)}
						</Button>
					</Link>
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
				</Stack>

				{/* last 24 hours charts */}
				<Card variant="outlined">
					<CardContent>
						{isDefined(data) && data.data.filter((x) => isDefined(x.humidity) && isDefined(x.temperature)).length > 0 ? (
							<ResponsiveContainer width="100%" height={100}>
								<ComposedChart data={data.data}>
									{/* grid */}
									<CartesianGrid stroke="#F5F5F5" strokeOpacity="0.5" />
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
										labelFormatter={(date, payload) => {
											try {
												return <span>{format.date(new Date(payload[0].payload.date), 'Pp')}</span>;
											} catch (e) {
												return '';
											}
										}}
									/>

									{/* temperature area */}
									<Area
										type="monotone"
										dataKey="temperature"
										yAxisId="temperature"
										label={translate(TRANSLATIONS.GENERAL.temperature)}
										strokeWidth={2}
										stroke="#c692ff"
										fill="#c692ff"
									/>
									
									{/* humidity bar */}
									<Bar dataKey="humidity" yAxisId="humidity" label={translate(TRANSLATIONS.GENERAL.humidity)} barSize={10} fill="#15bca6" />
								</ComposedChart>
							</ResponsiveContainer>
						) : (
							<Box sx={{ py: 5, textAlign: 'center', color: ({ palette }) => palette.text.disabled }}>
								<Typography variant="body2">{translate(TRANSLATIONS.GENERAL.noData)}</Typography>
							</Box>
						)}
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
 * TODO: move elsewhere
 * WeatherStationCard component data type
 * @export
 */
export type WeatherStationData = {
	date: string;
	temperature: number;
	humidity: number;
};

/**
 * TODO: move elsewhere
 * WeatherStationCard component chart enumeration
 * @export
 */
export enum WeatherStationChart {
	TEMPERATURE,
	HUMIDITY,
}
