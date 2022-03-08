import { Backdrop as MuiBackdrop, BackdropProps as MuiBackdropProps, CircularProgress } from '@mui/material';
import React from 'react';

/**
 * Backdrop with children
 * @return {JSX.Element}
 * @constructor
 */
export const BackdropOverlay: React.FC<MuiBackdropProps> = ({ children, sx, ...props }) => {
	return (
		<>
			<MuiBackdrop
				sx={{
					zIndex: ({ zIndex }) => zIndex.drawer + 1,
					color: ({ palette }) => palette.secondary.main,
					...sx,
				}}
				{...props}
			>
				<CircularProgress color="inherit" />
			</MuiBackdrop>
			{children}
		</>
	);
};
