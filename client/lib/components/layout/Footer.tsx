import { Box, Container, Grid, Typography } from '@mui/material';
import { NextComponentType } from 'next';
import React from 'react';

/**
 * Footer component
 * @export
 * @return {JSX.Element}
 * @constructor
 */
export const Footer: NextComponentType = () => {
	return (
		<Box
			sx={{
				background: ({ palette }) => palette.primary.main,
				color: ({ palette }) => palette.primary.contrastText,
				paddingY: ({ spacing }) => spacing(3),
			}}
		>
			<Container>
				<Grid container>
					<Grid item container xs={12} justifyContent="space-between" alignItems="center">
						<Typography>&copy; BIOT22SST06 {new Date().getFullYear()}</Typography>
					</Grid>
				</Grid>
			</Container>
		</Box>
	);
};
