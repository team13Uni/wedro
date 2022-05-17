export const TRANSLATIONS = {
	LOADER: {
		title: {
			cs: 'Načítám...',
			en: 'Loading...',
		},
	},
	AUTH: {
		name: {
			cs: 'Jméno',
			en: 'Name',
		},
		email: {
			cs: 'E-mail',
			en: 'E-mail',
		},
		password: {
			cs: 'Heslo',
			en: 'Password',
		},
		username: {
			cs: 'Username',
			en: 'Username',
		},
	},
	WEATHER_STATIONS: {
		title: {
			cs: 'Měřící místa',
			en: 'Weather locations',
		},
	},
	WEATHER_STATION_DETAIL: {
		title: {
			cs: 'Měřící stanice {weatherStationName}',
			en: 'Weather station {weatherStationName}',
		},
		noNode: {
			cs: 'Lokace nemá přiřazené žádnou měřící stanici',
			en: 'Location has no weather station assigned',
		},
		chartTitle: {
			cs: 'Graf v čase',
			en: 'Chart in time',
		},
		chartConfig: {
			cs: 'Nastavení grafu',
			en: 'Graph configuration',
		},
		configDialog: {
			title: {
				cs: 'Nastavení grafu měřící stanice',
				en: 'Chart configuration of weather station',
			},
			description: {
				cs: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. A animi assumenda cupiditate deserunt ea eum illum iusto neque quasi, quibusdam.',
				en: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. A animi assumenda cupiditate deserunt ea eum illum iusto neque quasi, quibusdam.',
			},
			dateFrom: {
				cs: 'Od',
				en: 'From',
			},
			dateTo: {
				cs: 'Do',
				en: 'To',
			},
			cancel: {
				cs: 'Zrušit',
				en: 'Cancel',
			},
			save: {
				cs: 'Uložit',
				en: 'Save',
			},
			granularity: {
				cs: 'Granularita',
				en: 'Granularity',
			},
			granularityType: {
				minute: {
					cs: 'Minuta',
					en: 'Minute',
				},
				'5-minutes': {
					cs: '5 minut',
					en: '5 minutes',
				},
				hour: {
					cs: 'Hodina',
					en: 'Hour',
				},
				day: {
					cs: 'Den',
					en: 'Day',
				},
				month: {
					cs: 'Měsíc',
					en: 'Month',
				},
			},
		},
	},
	LOGIN: {
		title: {
			cs: 'Přihlášení',
			en: 'Login',
		},
		login: {
			cs: 'Přihlásit se',
			en: 'Sign in',
		},
		githubLogin: {
			cs: 'Přihlásit se pomocí GitHubu',
			en: 'Sign in with GitHub',
		},
		registerCta: {
			cs: 'Ještě nemáte účet?',
			en: "Don' have an account yet?",
		},
	},
	WEATHER_STATION_CARD: {
		available: {
			cs: 'Dostupná',
			en: 'Available',
		},
		noNode: {
			cs: 'Bez měřící stanice',
			en: 'No weather station',
		},
		unavailable: {
			cs: 'Nedostupná',
			en: 'Unavailable',
		},
		unavailableTooltip: {
			cs: 'Naposledy dostupná {date}',
			en: 'Last available {date}',
		},
		currentTemperature: {
			cs: 'Aktuální teplota',
			en: 'Current temperature',
		},
		currentHumidity: {
			cs: 'Aktuální vlhkost',
			en: 'Current humidity',
		},
		dayHighsLows: {
			cs: 'Hi/Lo 24h',
			en: 'Hi/Lo 24h',
		},
	},
	ERRORS: {
		loading: {
			cs: 'Chyba při načítání',
			en: 'Error while loading',
		},
	},
	REGISTER: {
		title: {
			cs: 'Registrace',
			en: 'Register',
		},
		register: {
			cs: 'Vytvořit účet',
			en: 'Create an account',
		},
		loginCta: {
			cs: 'Nebo již máte účet?',
			en: 'Already have an account?',
		},
		usernameInUse: {
			cs: 'Username je již zabraný',
			en: 'Username already exists',
		},
		invalidCredentials: {
			cs: 'Nesprávné údaje',
			en: 'Invalid credentials',
		},
	},
	INDEX: {
		title: {
			cs: 'Aplikace Wedro',
			en: 'Wedro application',
		},
		visionTitle: {
			cs: 'Vize',
			en: 'Vision',
		},
		visionText: {
			cs: 'Produkt Wedro poskytuje řešení monitorování teploty a vlhkosti na různých lokacích. Administrátor aplikace může přidávat a rozmísťovat měřící stanice. Tyto stanice následně posílají naměřené data do cloudové aplikace, která je spracuje. Uživatelé si pak můžou v lehko vstřebatelné podobě prohlížet.',
			en: 'The Wedro product provides a solution for monitoring temperature and humidity at various locations. The application administrator can add and deploy measuring stations. These stations then send the measured data to the cloud application, which processes it. Users can then view in an easily digestible form.',
		},
		authorsTitle: {
			cs: 'Autoři',
			en: 'Authors',
		},
	},
	HEADER: {
		translationToggle: {
			cs: 'Translate to English',
			en: 'Přeložit do Češtiny',
		},
		home: {
			cs: 'Domů',
			en: 'Home',
		},
		login: {
			cs: 'Přihlásit se',
			en: 'Login',
		},
	},
	GENERAL: {
		notAvailable: {
			cs: 'N/A',
			en: 'N/A',
		},
		high: {
			cs: 'Hi {value}',
			en: 'Hi {value}',
		},
		low: {
			cs: 'Lo {value}',
			en: 'Lo {value}',
		},
		measuredAt: {
			cs: 'Naměřeno {date}',
			en: 'Measured on {date}',
		},
		seaLevel: {
			cs: '{seaLevel} m n.m.',
			en: '{seaLevel} m above sea level',
		},
		active: {
			cs: 'Aktivní',
			en: 'Active',
		},
		inactive: {
			cs: 'Neaktivní',
			en: 'Inactive',
		},
		temperature: {
			cs: 'Teplota',
			en: 'Temperature',
		},
		humidity: {
			cs: 'Vlhkost',
			en: 'Humidity',
		},
		email: {
			cs: 'Email',
			en: 'Email',
		},
		role: {
			user: {
				cs: 'Uživatel',
				en: 'User',
			},
			admin: {
				cs: 'Administrátor',
				en: 'Admin',
			},
		},
		phone: {
			cs: 'Telefon',
			en: 'Phone',
		},
		account: {
			cs: 'Účet',
			en: 'Account',
		},
		noData: {
			cs: 'Nejsou k dispozici žádná data',
			en: 'No data available',
		},
		logout: {
			cs: 'Odhlásit se',
			en: 'Logout',
		},
		open: {
			cs: 'Otevřít',
			en: 'Open',
		},
		edit: {
			cs: 'Upravit',
			en: 'Edit',
		},
		delete: {
			cs: 'Odstranit',
			en: 'Delete',
		},
		create: {
			cs: 'Vytvořit',
			en: 'Create',
		},
		uncategorized: {
			cs: 'Nekategorizováno',
			en: 'Uncategorized',
		},
	},
};
