import { Email, Phone } from '@mui/icons-material';
import { Avatar, Box, Button, Card, CardActions, CardContent, Container, Grid, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { Layout } from '@wedro/components';
import { TRANSLATIONS } from '@wedro/constants';
import { useTranslate } from '@wedro/hooks';
import { NextPageWithAuth } from '@wedro/types';
import { shuffleArray } from '@wedro/utils';
import { useSession } from 'next-auth/react';
import React from 'react';

/**
 * Application authors page
 */
const AUTHORS = [
	{
		name: 'Milan Ondráš',
		email: 'milan.ondras@plus4u.net',
		avatar: '/static/images/mo.png',
	},

	{
		name: 'Filip Ditrich',
		email: 'filip.ditrich@plus4u.net',
		avatar: '/static/images/fd.png',
	},

	{
		name: 'Karalina Dabul',
		email: 'karalina.dabul@plus4u.net',
		avatar: '/static/images/dk.png',
	},

	{
		name: 'Martin Foldyna',
		email: 'martin.foldyna@plus4u.net',
		avatar: '/static/images/mf.png',
	},
	{
		name: 'Daniel Jantulík',
		email: 'daniel.jantulik@plus4u.net',
	},
	{
		name: 'Tomáš Hrnčíř',
		email: 'tomas.hrncir@plus4u.net',
	},
];

/**
 * Index home page
 * @constructor
 */
const IndexPage: NextPageWithAuth = () => {
	const { translate } = useTranslate();
	const { data: session } = useSession();

	return (
		<Layout title={translate(TRANSLATIONS.INDEX.title)}>
			<Container>
				<Typography variant="h3" component="h1" textAlign="center" sx={{ my: ({ spacing }) => spacing(4) }}>
					{translate(TRANSLATIONS.INDEX.title)}
				</Typography>

				{/* vision */}
				<Box sx={{ mb: ({ spacing }) => spacing(4) }}>
					<Typography variant="h5" gutterBottom>
						{translate(TRANSLATIONS.INDEX.visionTitle)}
					</Typography>
					<Typography variant="body1" sx={{ color: grey[600] }}>
						{translate(TRANSLATIONS.INDEX.visionText)}
					</Typography>
				</Box>

				{/* authors */}
				<Box>
					<Typography variant="h5" gutterBottom>
						{translate(TRANSLATIONS.INDEX.authorsTitle)}
					</Typography>

					{/* author cards */}
					<Grid container spacing={4}>
						{
							// shuffle the authors array so nobody is always the first
							shuffleArray(AUTHORS).map((author) => (
								<Grid item xs={6} lg={4}>
									<Card>
										<CardContent sx={{ textAlign: 'center' }}>
											<Avatar
												src={author.avatar}
												alt={author.name}
												sx={{
													width: 128,
													height: 128,
													fontSize: '2rem',
													mx: 'auto',
													mb: ({ spacing }) => spacing(2),
												}}
											>
												{author.name.charAt(0)}
											</Avatar>
											<Typography variant="h5" component="div">
												{author.name}
											</Typography>
										</CardContent>
										<CardActions sx={{ borderTop: `1px solid ${grey[300]}` }}>
											<a href={`mailto:${author.email}`}>
												<Button size="small" startIcon={<Email />}>
													{translate(TRANSLATIONS.GENERAL.email)}
												</Button>
											</a>
											<Button size="small" disabled startIcon={<Phone />}>
												{translate(TRANSLATIONS.GENERAL.phone)}
											</Button>
										</CardActions>
									</Card>
								</Grid>
							))
						}
					</Grid>
				</Box>
			</Container>
		</Layout>
	);
};

IndexPage.requiresAuth = false;
IndexPage.denyLogged = false;

export default IndexPage;
