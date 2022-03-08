import createCache from '@emotion/cache';
import { red } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';

export function createEmotionCache() {
	return createCache({ key: 'css' });
}

export const theme = createTheme({
	palette: {
		primary: {
			main: '#54416D',
		},
		secondary: {
			main: '#DCD9E1',
		},
		error: {
			main: red.A400,
		},
	},
});
