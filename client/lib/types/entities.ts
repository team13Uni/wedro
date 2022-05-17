export type Location = {
	_id: string;
	name: string;
	weatherStation?: WeatherStation;
	state: 'active' | 'inactive';
	coordinates: [number, number];
	seaLevel: number;
};

export type WeatherStation = {
	_id: string;
	name: string;
	unavailable: boolean;
	active: boolean;
	lastActiveAt: string;
};

export type Measurement = {
	temperature: number;
	humidity: number;
	measuredAt: string;
	type: 'hour' | 'day' | 'month' | 'year';
};

export type WedroUser = {
	username: string;
	email: string;
	role: WedroUserRole;
};

export enum WedroUserRole {
	ADMIN = 'admin',
	USER = 'user',
}
