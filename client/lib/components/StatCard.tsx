import { Box, Stack, Tooltip as MuiTooltip, Typography } from '@mui/material';
import { TRANSLATIONS } from '@wedro/constants';
import { useTranslate } from '@wedro/hooks';
import { useFormat } from '@wedro/hooks/useFormat';
import { isDefined } from '@wedro/utils';
import React, { FC, ReactNode } from 'react';

/**
 * StatCard component
 * @returns {JSX.Element}
 * @constructor
 */
export const StatCard: FC<StatCardProps> = ({ data, formatter, min, max, icon }) => {
	const format = useFormat();
	const { translate } = useTranslate();

	return (
		<Typography variant="h4">
			<Stack spacing={1} direction="row">
				{isDefined(icon) && icon}
				{isDefined(data) ? (
					<MuiTooltip title={translate(TRANSLATIONS.GENERAL.measuredAt, { date: format.date(new Date(data.date), 'PPPp') })}>
						<span>{isDefined(formatter) ? formatter(data.value) : data.value}</span>
					</MuiTooltip>
				) : (
					'---'
				)}
				<Box>
					<Typography variant="body2">
						<MuiTooltip title={isDefined(max) ? translate(TRANSLATIONS.GENERAL.measuredAt, { date: format.date(new Date(max.date), 'PPPp') }) : ''}>
							<span>
								{translate(TRANSLATIONS.GENERAL.high, {
									value: isDefined(max) ? (isDefined(formatter) ? formatter(max.value) : max.value) : translate(TRANSLATIONS.GENERAL.notAvailable),
								})}
							</span>
						</MuiTooltip>
					</Typography>
					<Typography variant="body2">
						<MuiTooltip title={isDefined(min) ? translate(TRANSLATIONS.GENERAL.measuredAt, { date: format.date(new Date(min.date), 'PPPp') }) : ''}>
							<span>
								{translate(TRANSLATIONS.GENERAL.low, {
									value: isDefined(min) ? (isDefined(formatter) ? formatter(min.value) : min.value) : translate(TRANSLATIONS.GENERAL.notAvailable),
								})}
							</span>
						</MuiTooltip>
					</Typography>
				</Box>
			</Stack>
		</Typography>
	);
};

/**
 * Component prop types
 * @private
 */
type StatCardProps = {
	data?: { date: string | Date; value: number } | null;
	formatter?: (value: number) => string;
	icon?: ReactNode;
	min?: { date: string | Date; value: number } | null;
	max?: { date: string | Date; value: number } | null;
};
