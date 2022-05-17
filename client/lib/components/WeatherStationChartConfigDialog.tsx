// TODO: move
import { DateTimePicker } from '@mui/lab';
import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogProps,
	DialogTitle,
	FormGroup,
	Stack,
	TextField,
	ToggleButton,
	ToggleButtonGroup,
	Typography,
} from '@mui/material';
import { TRANSLATIONS } from '@wedro/constants';
import { useTranslate } from '@wedro/hooks';
import { isDefined } from '@wedro/utils';
import { differenceInMinutes } from 'date-fns';
import React, { FC, useEffect, useState } from 'react';

/**
 * Dialog for configuring weather station chart
 * @returns {JSX.Element}
 * @constructor
 */
export const WeatherStationChartsConfigDialog: FC<WeatherStationChartsConfigDialogProps> = ({ values: inputValues, setValues, ...props }) => {
	const [dateFrom, setDateFrom] = useState<Date>(inputValues.dateFrom);
	const [dateTo, setDateTo] = useState<Date>(inputValues.dateTo);
	const { translate } = useTranslate();
	const [granularity, setGranularity] = useState<GranularityType>(inputValues.granularity);
	const possibleGranularityTypes = getPossibleGranularityTypes(dateFrom, dateTo);

	/** automatically set allowed granularity if the current is not allowed */
	useEffect(() => {
		const isCurrentAllowed = possibleGranularityTypes[granularity];
		if (!isCurrentAllowed) {
			const firstPossibleType = Object.entries(possibleGranularityTypes).find(([_, possible]) => possible);
			if (isDefined(firstPossibleType)) {
				setGranularity(firstPossibleType[0] as GranularityType);
			}
		}
	}, [possibleGranularityTypes]);

	return (
		<Dialog {...props}>
			<DialogTitle>{translate(TRANSLATIONS.WEATHER_STATION_DETAIL.configDialog.title)}</DialogTitle>
			<DialogContent>
				<Stack spacing={2}>
					<DialogContentText>{translate(TRANSLATIONS.WEATHER_STATION_DETAIL.configDialog.description)}</DialogContentText>

					{/* date range */}
					<FormGroup>
						<Box display="flex" alignItems="center" gap={1}>
							<DateTimePicker
								label={translate(TRANSLATIONS.WEATHER_STATION_DETAIL.configDialog.dateFrom)}
								value={dateFrom}
								onChange={(newDateFrom) => {
									if (isDefined(newDateFrom)) setDateFrom(newDateFrom);
								}}
								renderInput={(params) => <TextField {...params} />}
							/>
							<Box sx={{ mx: 2 }}> – </Box>
							<DateTimePicker
								label={translate(TRANSLATIONS.WEATHER_STATION_DETAIL.configDialog.dateFrom)}
								value={dateTo}
								onChange={(newDateTo) => {
									if (isDefined(newDateTo)) setDateTo(newDateTo);
								}}
								renderInput={(params) => <TextField {...params} />}
							/>
						</Box>
					</FormGroup>

					{/*	type */}
					<FormGroup>
						<Typography sx={{ fontSize: 14, fontWeight: 'bold', mb: 1 }} color="text.secondary" component="label">
							{translate(TRANSLATIONS.WEATHER_STATION_DETAIL.configDialog.granularity)}
						</Typography>
						<ToggleButtonGroup color="primary" value={granularity} exclusive onChange={(e, v) => setGranularity(v)}>
							{Object.entries(possibleGranularityTypes).map(([value, allowed]) => (
								<ToggleButton key={value} sx={{ flexGrow: 1 }} value={value} disabled={!allowed}>
									{translate(TRANSLATIONS.WEATHER_STATION_DETAIL.configDialog.granularityType[value as GranularityType])}
								</ToggleButton>
							))}
						</ToggleButtonGroup>
					</FormGroup>
				</Stack>
			</DialogContent>
			<DialogActions>
				<Button onClick={(e) => props.onClose?.(e, 'escapeKeyDown')}>{translate(TRANSLATIONS.WEATHER_STATION_DETAIL.configDialog.cancel)}</Button>
				<Button
					onClick={(e) => {
						setValues({ dateFrom, dateTo, granularity });
						props.onClose?.(e, 'escapeKeyDown');
					}}
				>
					{translate(TRANSLATIONS.WEATHER_STATION_DETAIL.configDialog.save)}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

/**
 * Supported granularity types
 * @export
 */
export type GranularityType = 'minute' | '5-minutes' | 'hour' | 'day' | 'month';

/**
 * Returns possible granularity types based on the current date range
 * @param {Date} dateFrom
 * @param {Date} dateTo
 * @returns {Record<GranularityType, boolean>}
 */
export const getPossibleGranularityTypes = (dateFrom: Date, dateTo: Date): Record<GranularityType, boolean> => {
	const minDiff = Math.abs(differenceInMinutes(dateFrom, dateTo));
	return {
		minute: true, // max 12 hours
		'5-minutes': true, // max 24 hours
		hour: true, // max 7 days
		day: minDiff <= 6 * 30 * 24 * 60, // max 6 months
		month: minDiff <= 6 * 12 * 30 * 24 * 60, // max 6 years
	};
};

/**
 * Component values type
 * @export
 */
export type WeatherStationChartsConfigDialogValues = {
	dateFrom: Date;
	dateTo: Date;
	granularity: GranularityType;
};

/**
 * Component props type
 * @private
 */
type WeatherStationChartsConfigDialogProps = {
	values: WeatherStationChartsConfigDialogValues;
	setValues: (values: WeatherStationChartsConfigDialogValues) => void;
} & DialogProps;
