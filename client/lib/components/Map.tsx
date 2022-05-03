import ReactMapboxGl from 'react-mapbox-gl';

/**
 * Mapbox Map component
 * @constructor
 */
export const Map = ReactMapboxGl({
	accessToken: (process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || process.env.MAPBOX_ACCESS_TOKEN) as string,
});
