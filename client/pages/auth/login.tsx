import { LoadingButton } from '@mui/lab';
import { Container, Grid, TextField, Typography } from '@mui/material';
import { FormikFieldMui, FormikWrapper, Layout } from '@wedro/components';
import { TRANSLATIONS } from '@wedro/constants';
import { useTranslate } from '@wedro/hooks';
import { NextPageWithAuth } from '@wedro/types';
import { isDefined, isEmpty } from '@wedro/utils';
import { Formik, FormikConfig } from 'formik';
import { signIn, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';
import * as Yup from 'yup';

/**
 * Login page
 * @constructor
 */
const LoginPage: NextPageWithAuth = (props) => {
	const router = useRouter();
	const { data: session, status } = useSession();
	const { translate } = useTranslate();

	/**
	 * Form initial values
	 * @type {LoginDtoIn}
	 */
	const initialValues: LoginDtoIn = {
		username: isDefined(router.query.username) ? decodeURIComponent(router.query.username?.toString()) : '',
		password: '',
	};

	/**
	 * Form submit handler
	 * @param values
	 * @param setFieldError
	 */
	const loginSubmitHandler: FormikConfig<typeof initialValues>['onSubmit'] = async (values, { setFieldError }) => {
		const loginRes = await signIn<'credentials'>('credentials', {
			username: values.username,
			password: values.password,
			callbackUrl: `${window.location.origin}`,
			redirect: false,
		});

		if (isDefined(loginRes) && isDefined(loginRes?.error)) {
			if (!isEmpty(loginRes.error)) {
				if (/username|user/gi.test(loginRes.error)) setFieldError('username', translate(loginRes.error));
				else setFieldError('password', translate(loginRes.error));
			} else {
				setFieldError('username', ' ');
				setFieldError('password', ' ');
			}
		} else if (loginRes?.ok) {
			await router.push('/locations');
		} else {
			console.error('[loginSubmitHandler] Sign in failed.', loginRes);
		}
	};

	return (
		<Layout title={translate(TRANSLATIONS.LOGIN.title)} isLoading={status === 'authenticated' || status === 'loading'}>
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
				<Formik initialValues={initialValues} validationSchema={loginFormSchema} onSubmit={loginSubmitHandler}>
					{({ isSubmitting, isValid, dirty, values }) => (
						<Grid container component={FormikWrapper} spacing={3} processing={isSubmitting}>
							{/* username input */}
							<Grid item xs={12}>
								<FormikFieldMui
									FieldInput={TextField}
									fullWidth
									label={translate(TRANSLATIONS.AUTH.username)}
									autoComplete="username"
									autoFocus
									type="text"
									name="username"
									variant="outlined"
								/>
							</Grid>

							{/* password input */}
							<Grid item xs={12}>
								<FormikFieldMui
									FieldInput={TextField}
									fullWidth
									name="password"
									label={translate(TRANSLATIONS.AUTH.password)}
									type="password"
									autoComplete="current-password"
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
									// disabled={!(dirty && isValid)}
								>
									{translate(TRANSLATIONS.LOGIN.login)}
								</LoadingButton>
							</Grid>

							{/* register link */}
							<Grid item xs={12}>
								<Link
									href={{
										pathname: '/register',
										query: !isEmpty(values.username)
											? {
													username: encodeURIComponent(values.username),
											  }
											: undefined,
									}}
								>
									{translate(TRANSLATIONS.LOGIN.registerCta)}
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
LoginPage.requiresAuth = false;
LoginPage.denyLogged = true;

/**
 * Login form schema
 */
const loginFormSchema = Yup.object().shape<LoginDtoIn>({
	username: Yup.string().required(),
	password: Yup.string().required(),
});

/**
 * Login DtoIn type
 */
export type LoginDtoIn = {
	username: string;
	password: string;
};

export default LoginPage;
