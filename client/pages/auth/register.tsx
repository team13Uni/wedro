import { Visibility, VisibilityOff } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Container, Grid, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import { apiClient } from '@wedro/app';
import { FormikFieldMui, FormikWrapper, Layout } from '@wedro/components';
import { TRANSLATIONS } from '@wedro/constants';
import { useTranslate } from '@wedro/hooks';
import { NextPageWithAuth } from '@wedro/types';
import { isDefined, isEmpty } from '@wedro/utils';
import { Formik, FormikConfig } from 'formik';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import * as Yup from 'yup';

/**
 * Register page view
 * @route /register
 * @return {JSX.Element}
 * @constructor
 */
const RegisterPage: NextPageWithAuth = () => {
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);
	const { data: session, status } = useSession();
	const { translate } = useTranslate();

	/**
	 * Form initial values
	 */
	const initialValues: RegisterDtoIn = {
		username: isDefined(router.query.username) ? decodeURIComponent(router.query.username.toString()) : '',
		name: '',
		password: '',
	};

	/**
	 * Form submit handler
	 * @param {RegisterInputDto} values
	 * @param {(field: string, message: (string | undefined)) => void} setFieldError
	 * @return {Promise<void>}
	 */
	const registerSubmitHandler: FormikConfig<typeof initialValues>['onSubmit'] = async (values, { setFieldError, setStatus }) => {
		try {
			const { data } = await apiClient({ url: '/api/auth/register', data: values, method: 'POST' });

			// redirect to login with prefilled username
			await router.push({
				pathname: '/login',
				query: !isEmpty(data.user.username)
					? {
							username: encodeURIComponent(data.user.username),
					  }
					: undefined,
			});
		} catch (exception: Error | any) {
			switch (exception.name) {
				case 'user_already_exists': {
					setFieldError('username', translate(TRANSLATIONS.REGISTER.usernameInUse));
					break;
				}
				case 'wrong_username_or_password': {
					setFieldError('password', translate(TRANSLATIONS.REGISTER.invalidCredentials));
					break;
				}
				default: {
					setStatus(exception.message);
					break;
				}
			}
		}
	};

	return (
		<Layout title={translate(TRANSLATIONS.REGISTER.title)} isLoading={status === 'authenticated' || status === 'loading'}>
			<Container component="main" maxWidth="xs" sx={{ m: 'auto', textAlign: 'center' }}>
				{/* Wedro logo */}
				<Typography
					variant="h4"
					sx={{
						fontWeight: 'bold',
						cursor: 'pointer',
						marginBottom: ({ spacing }) => spacing(4),
					}}
				>
					Wedro
				</Typography>

				{/* form */}
				<Formik initialValues={initialValues} validationSchema={registerFormSchema} onSubmit={registerSubmitHandler}>
					{({ isSubmitting, isValid, dirty, values }) => (
						<Grid container component={FormikWrapper} spacing={3} processing={isSubmitting}>
							{/* full name */}
							<Grid item xs={12}>
								<FormikFieldMui
									FieldInput={TextField}
									fullWidth
									label={translate({ cs: 'Jméno', en: 'Name' })}
									type="text"
									name="name"
									variant="outlined"
								/>
							</Grid>

							{/* username input */}
							<Grid item xs={12}>
								<FormikFieldMui
									FieldInput={TextField}
									fullWidth
									label={translate({ cs: 'Username', en: 'Username' })}
									type="text"
									name="username"
									variant="outlined"
								/>
							</Grid>

							{/* password input */}
							<Grid item xs={12}>
								<FormikFieldMui
									required
									fullWidth
									FieldInput={TextField}
									InputProps={{
										endAdornment: (
											<InputAdornment position="end">
												<IconButton
													onClick={() => {
														setShowPassword(!showPassword);
													}}
													edge="end"
												>
													{showPassword ? <Visibility /> : <VisibilityOff />}
												</IconButton>
											</InputAdornment>
										),
									}}
									label={translate(TRANSLATIONS.AUTH.password)}
									type={showPassword ? 'text' : 'password'}
									name="password"
									variant="outlined"
								/>
							</Grid>

							{/* submit button */}
							<Grid item xs={12}>
								<LoadingButton
									loading={isSubmitting}
									type="submit"
									fullWidth
									variant="contained"
									color="primary"
									size="large"
									sx={{ mb: ({ spacing }) => spacing(2) }}
									// disabled={!(dirty && isValid)}
								>
									{translate(TRANSLATIONS.REGISTER.register)}
								</LoadingButton>
							</Grid>

							{/* login link */}
							<Grid item xs={12}>
								<Link
									href={{
										pathname: '/login',
										query: !isEmpty(values.username)
											? {
													username: encodeURIComponent(values.username),
											  }
											: undefined,
									}}
								>
									{translate(TRANSLATIONS.REGISTER.loginCta)}
								</Link>
							</Grid>
						</Grid>
					)}
				</Formik>
			</Container>
		</Layout>
	);
};

/** page auth guarding */
RegisterPage.requiresAuth = false;
RegisterPage.denyLogged = true;

/**
 * Register form schema
 */
const registerFormSchema = Yup.object().shape<RegisterDtoIn>({
	username: Yup.string().required(),
	password: Yup.string().required(),
	name: Yup.string().required(),
});

export type RegisterDtoIn = { username: string; password: string; name: string };

export default RegisterPage;
