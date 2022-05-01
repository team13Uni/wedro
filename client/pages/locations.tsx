import { DeviceThermostat, ModeEdit, Water } from '@mui/icons-material';
import {
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	Container,
	Divider,
	Grid,
	Stack,
	ToggleButton,
	ToggleButtonGroup,
	Typography,
} from '@mui/material';
import { apiClient } from '@wedro/app';
import { Layout } from '@wedro/components';
import { TRANSLATIONS } from '@wedro/constants';
import { useTranslate } from '@wedro/hooks';
import { useFormat } from '@wedro/hooks/useFormat';
import { Location, NextPageWithAuth, WedroUserRole } from '@wedro/types';
import { arrayOf, isDefined, randomIntBetween } from '@wedro/utils';
import { addHours } from 'date-fns';
import { GetServerSideProps } from 'next';
import { getSession, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useCallback, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

/**
 * Locations page
 * @constructor
 */
const LocationsPage: NextPageWithAuth<LocationsPageProps> = ({ locations }) => {
	const { translate } = useTranslate();
	const router = useRouter();
	const { data: session, status } = useSession();
	const [ locationDialog, setSubjectDialog ] = useState<string | null>(null);
	const format = useFormat();
	
	/** TODO: location delete handler */
	const handleSubjectDelete = useCallback(async (locationId: string) => {
		try {
			await apiClient({ url: `/api/location/${ locationId }`, method: 'DELETE' }, session?.accessToken);
			await router.replace(router.asPath);
		} catch (error) {
			console.log(error);
		}
	}, [ router, session ]);
	
	const [ currentChart, setCurrentChart ] = useState(0);
	
	return (
		<Layout title={ translate(TRANSLATIONS.LOCATION_LIST.title) }>
			<Container>
				<Box display='flex' alignItems='center' justifyContent='between'>
					<Typography variant='h4' component='h1' gutterBottom>
						{ translate(TRANSLATIONS.LOCATION_LIST.title) }
					</Typography>
					{
						isDefined(session) &&
						session.account.role === WedroUserRole.ADMIN && (
							<Button sx={ { ml: 'auto' } }
							        size='small'
							        startIcon={ <ModeEdit /> }
							        onClick={ () => setSubjectDialog('') }>
								{ translate(TRANSLATIONS.GENERAL.create) }
							</Button>
						)
					}
				</Box>
				
				<Grid container spacing={ 3 }>
					{
						locations.map((location, key) => {
							const data = arrayOf(randomIntBetween(5, 15)).map((key) => ({
								date: addHours(new Date('01/01/2022'), key),
								hum: randomIntBetween(0, 100),
								temp: randomIntBetween(0, 35),
							}));
							
							return (
								<Grid item xs={ 12 } lg={ 6 } key={ location._id }>
									<Card variant='outlined'>
										<CardContent>
											<Typography sx={ { fontSize: 14 } } color='text.secondary' gutterBottom>
												Weather station { key }
											</Typography>
											<Typography variant='h5' component='div'>
												{ location.name }
											</Typography>
											<Typography sx={ { mb: 1.5 } } color='text.secondary'>
												{ location.state }
											</Typography>
											
											<Stack direction='row' spacing={ 2 } mb={ 3 }>
												<Card variant='outlined'>
													<CardContent>
														<Typography sx={ { fontSize: 14 } } color='text.secondary' gutterBottom>
															Aktuální teplota
														</Typography>
														<Stack direction='row' spacing={ 2 }>
															<DeviceThermostat fontSize='large' />
															<Typography variant='h4' component='div'>
																13 °C
															</Typography>
														</Stack>
													</CardContent>
												</Card>
												
												<Card variant='outlined'>
													<CardContent>
														<Typography sx={ { fontSize: 14 } } color='text.secondary' gutterBottom>
															Aktuální vlhkost
														</Typography>
														<Stack direction='row' spacing={ 2 }>
															<Water fontSize='large' />
															<Typography variant='h4' component='div'>
																12 %
															</Typography>
														</Stack>
													</CardContent>
												</Card>
												
												<Card variant='outlined'>
													<CardContent>
														<Typography sx={ { fontSize: 14 } } color='text.secondary' gutterBottom>
															Hi/Low za 24h
														</Typography>
														<Stack direction='row' spacing={ 2 }>
															<Typography variant='h5' component='div'>
																5 °C
															</Typography>
															<Divider orientation='vertical' flexItem />
															<Typography variant='h5' component='div'>
																17 °C
															</Typography>
														</Stack>
													</CardContent>
												</Card>
											</Stack>
											
											<Card variant='outlined'>
												<CardContent>
													<CardActions sx={{ marginBottom: 2 }}>
														<ToggleButtonGroup
															sx={ { margin: 'auto' } }
															size='small'
															color='primary'
															value={ currentChart }
															exclusive
															onChange={ (e, v) => setCurrentChart(v) }
														>
															<ToggleButton value={ 0 }>Teplota</ToggleButton>
															<ToggleButton value={ 1 }>Vlhkost</ToggleButton>
														</ToggleButtonGroup>
													</CardActions>
													
													<ResponsiveContainer width='100%' height={ 200 }>
														<AreaChart
															width={ 200 }
															height={ 60 }
															data={ data }
														>
															<CartesianGrid stroke='#F5F5F5' />
															<XAxis dataKey='date' tickFormatter={ (v, i) => format.date(data[i].date, 'p') } />
															<Tooltip formatter={ (value: number, key: string) => {
																switch (key) {
																	case 'hum':
																		return [ format.percent(value), 'Vlhkost' ];
																	case 'temp':
																		return [ format.number(value, {
																			style: 'unit',
																			unit: 'celsius',
																		}), 'Teplota' ];
																	default:
																		return [ null, null ];
																}
															} } labelFormatter={ (date) =>
																<span>{ format.date(new Date(date), 'Pp') }</span> } />
															{/*<Legend />*/ }
															{
																{
																	0: <Area type='monotone'
																	         dataKey='temp'
																	         label='Teplota'
																	         strokeWidth={ 2 }
																	         stroke='#ff7400'
																	         fill='#f9cb9c' />,
																	1: <Area type='monotone'
																	         dataKey='hum'
																	         label='Vlhkost'
																	         strokeWidth={ 2 }
																	         stroke='#005b96'
																	         fill='#b3cde0' />,
																}[currentChart]
															}
														
														</AreaChart>
													</ResponsiveContainer>
												</CardContent>
											</Card>
										</CardContent>
										<CardActions>
											<Button size='small'>Detail</Button>
										</CardActions>
									</Card>
								</Grid>
							);
						})
					}
				</Grid>
			</Container>
			
			{/*	location dialog */ }
			{/*<Dialog onClose={ () => setSubjectDialog(null) } open={ isDefined(locationDialog) } fullWidth>*/ }
			{/*	<DialogTitle>{ translate(translations.SUBJECT_FORM[isEmpty(locationDialog) ? 'createTitle' : 'updateTitle']) }</DialogTitle>*/ }
			{/*	<DialogContent>*/ }
			{/*		{*/ }
			{/*			isDefined(locationDialog) && (*/ }
			{/*				<SubjectDetailForm*/ }
			{/*					locationId={ locationDialog }*/ }
			{/*					onSubmitted={ async () => {*/ }
			{/*						// refresh serverSideProps*/ }
			{/*						await router.replace(router.asPath);*/ }
			{/*						setSubjectDialog(null);*/ }
			{/*					} }*/ }
			{/*				/>*/ }
			{/*			)*/ }
			{/*		}*/ }
			{/*	</DialogContent>*/ }
			{/*</Dialog>*/ }
		</Layout>
	);
};

/**
 * Locations page props
 */
export const getServerSideProps: GetServerSideProps = async (context) => {
	try {
		const session = await getSession(context);
		const { data } = await apiClient({ url: '/api/location', method: 'GET' }, session?.accessToken);
		
		console.log('[locations][debug] Loaded props', data);
		return { props: { locations: data } };
	} catch (error) {
		console.log('[locations][debug] Failed to load serverSideProps', error);
		return {
			redirect: {
				destination: '/',
				statusCode: 302,
			},
		};
	}
};

/**
 * Locations page props type
 * @export
 */
export type LocationsPageProps = {
	locations: Location[];
};

/** page auth guarding */
LocationsPage.requiresAuth = true;
LocationsPage.denyLogged = false;

/**
 * Page default export
 * @default
 */
export default LocationsPage;
