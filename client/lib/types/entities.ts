export type Location = {
	_id: string;
	name: string;
	node: WeatherStation;
	state: 'active' | 'inactive';
}

export type WeatherStation = {
	name: string;
	unavailable: boolean;
	active: boolean;
	lastActiveAt: string;
}

export type Measurement = {
	temperature: number;
	humidity: number;
	measuredAt: string;
	type: 'hour' | 'day' | 'month' | 'year';
}

export type WedroUser = {
	name: string;
	email: string;
	role: WedroUserRole;
}

export enum WedroUserRole {
	ADMIN = 'admin',
	USER = 'user'
}
