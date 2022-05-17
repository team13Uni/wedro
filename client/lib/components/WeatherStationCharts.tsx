import { Thermostat, Timeline, Water } from '@mui/icons-material';
import { Box, Button, Card, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { apiClient } from '@wedro/app';
import { WeatherStationChart, WeatherStationData } from '@wedro/components/WeatherStationCard';
import { GranularityType, WeatherStationChartsConfigDialog } from '@wedro/components/WeatherStationChartConfigDialog';
import { TRANSLATIONS } from '@wedro/constants';
import { useTranslate } from '@wedro/hooks';
import { useFormat } from '@wedro/hooks/useFormat';
import { useNow } from '@wedro/hooks/useNow';
import { subHours } from 'date-fns';
import { useSession } from 'next-auth/react';
import React, { FC, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import useSWR from 'swr';

/**
 * WeatherStationCharts component
 * @returns {JSX.Element}
 * @constructor
 */
export const WeatherStationCharts: FC<WeatherStationChartProps> = ({ weatherStationId }) => {
	const { translate } = useTranslate();
	const { data: session, status } = useSession();
	const format = useFormat();
	const now = useNow();
	const [currentChart, setCurrentChart] = useState<WeatherStationChart>(WeatherStationChart.TEMPERATURE);
	const [currentPeriod, setCurrentPeriod] = useState<[Date, Date]>([subHours(now, 24), now]);
	const [granularity, setGranularity] = useState<GranularityType>('hour');
	const [configDialogOpen, setConfigDialogOpen] = useState(false);

	/** get buckets from API */
	const { data, error, isValidating } = useSWR<{ data: WeatherStationData[] }>(
		() =>
			`/api/measurement/${weatherStationId}/buckets?dateFrom=${currentPeriod[0].toISOString()}&dateTo=${currentPeriod[1].toISOString()}&type=${granularity}`,
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
			<Card variant="outlined" sx={{ flexGrow: 1 }}>
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
							<Typography variant="h5">{translate(TRANSLATIONS.WEATHER_STATION_DETAIL.chartTitle)}</Typography>
							<Typography sx={{ fontSize: 14 }} color="colors.secondary">
								{format.date(currentPeriod[0], 'PPp')} - {format.date(currentPeriod[1], 'PPp')}
							</Typography>
						</Box>

						{/* config button */}
						<Button variant="contained" onClick={() => setConfigDialogOpen(true)} startIcon={<Timeline />}>
							{translate(TRANSLATIONS.WEATHER_STATION_DETAIL.chartConfig)}
						</Button>
					</Box>

					<Box
						sx={{
							border: (theme) => `1px solid ${theme.palette.divider}`,
							borderRadius: '5px',
							height: '100%',
						}}
					>
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart
								data={
									data?.data.map((x) => ({
										...x,
										temperature: x.temperature ?? NaN,
										humidity: x.humidity ?? NaN,
									})) || []
								}
							>
								{/* grid */}
								<CartesianGrid stroke="#F5F5F5" />
								{/* FIXME: x axis */}
								<XAxis
									dataKey="date"
									tickFormatter={(v) => {
										try {
											return format.date(new Date(v), 'p');
										} catch (e) {
											return '';
										}
									}}
								/>

								{/* y-axis */}
								<YAxis
									tickFormatter={(v) => {
										switch (currentChart) {
											case WeatherStationChart.HUMIDITY: {
												return format.percent(v);
											}
											case WeatherStationChart.TEMPERATURE: {
												return format.number(v, { style: 'unit', unit: 'celsius' });
											}
										}
									}}
								/>
								{/* tooltip */}
								<Tooltip
									formatter={(value: number, key: keyof WeatherStationData) => {
										switch (key) {
											case 'humidity':
												return [
													isNaN(value) ? translate(TRANSLATIONS.GENERAL.notAvailable) : format.percent(value),
													translate(TRANSLATIONS.GENERAL.humidity),
												];
											case 'temperature':
												return [
													isNaN(value)
														? translate(TRANSLATIONS.GENERAL.notAvailable)
														: format.number(value, {
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
											return <small>{format.date(new Date(date), 'Pp')}</small>;
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
												type="natural"
												dataKey="temperature"
												label={translate(TRANSLATIONS.GENERAL.temperature)}
												strokeWidth={2}
												stroke="#c692ff"
												fill="#c692ff"
											/>
										),
										[WeatherStationChart.HUMIDITY]: (
											<Area
												type="natural"
												dataKey="humidity"
												label={translate(TRANSLATIONS.GENERAL.humidity)}
												strokeWidth={2}
												stroke="#15bca6"
												fill="#15bca6"
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
					granularity,
				}}
				setValues={(newValues) => {
					setCurrentPeriod([newValues.dateFrom, newValues.dateTo]);
					setGranularity(newValues.granularity);
				}}
			/>
		</React.Fragment>
	);
};

/**
 * Component props type
 * @private
 */
type WeatherStationChartProps = { weatherStationId: string };
