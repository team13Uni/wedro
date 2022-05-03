import { CellWifi, SignalWifiStatusbarConnectedNoInternet4 } from '@mui/icons-material';
import { Chip, ChipProps, Tooltip as MuiTooltip } from '@mui/material';
import { TRANSLATIONS } from '@wedro/constants';
import { useTranslate } from '@wedro/hooks';
import { useFormat } from '@wedro/hooks/useFormat';
import React, { FC } from 'react';

/**
 * WeatherStationStatusChip component
 * @author filipditrich
 * @returns {JSX.Element}
 * @constructor
 */
export const WeatherStationStatusChip: FC<WeatherStationStatusChipProps> = ({ unavailable, lastActiveAt, ...props }) => {
	const { translate } = useTranslate();
	const format = useFormat();

	if (!unavailable) {
		return <Chip color="success" label={translate(TRANSLATIONS.WEATHER_STATION_CARD.available)} icon={<CellWifi />} {...props} />;
	}

	return (
		<MuiTooltip title={translate(TRANSLATIONS.WEATHER_STATION_CARD.unavailableTooltip, { date: format.date(new Date(lastActiveAt), 'PPPp') })}>
			<Chip
				color="warning"
				label={translate(TRANSLATIONS.WEATHER_STATION_CARD.unavailable)}
				icon={<SignalWifiStatusbarConnectedNoInternet4 />}
				{...props}
			/>
		</MuiTooltip>
	);
};

/**
 * WeatherStationStatusChip component props type
 * @private
 */
type WeatherStationStatusChipProps = {
	unavailable: boolean;
	lastActiveAt: string | Date;
} & Partial<ChipProps>;
