import { LoadingButton } from '@mui/lab';
import { Alert, AlertTitle, Grid, TextField } from '@mui/material';
import { apiClient } from '@wedro/app';
import { FormikFieldMui, FormikWrapper } from '@wedro/components';
import { TRANSLATIONS } from '@wedro/constants';
import { useTranslate } from '@wedro/hooks';
import { isDefined, isEmpty } from '@wedro/utils';
import { Formik, FormikConfig } from 'formik';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { FunctionComponent } from 'react';
import useSWR from 'swr';
import * as Yup from 'yup';

/**
 * NodeForm component
 * @return {JSX.Element}
 * @constructor
 */
const NodeForm: FunctionComponent<NodeFormProps> = ({ nodeId, onSubmitted }) => {
	const router = useRouter();
	const { data: session, status } = useSession({ required: true });
	const { translate } = useTranslate();

	// fetch topic info when editing (provided `topicId` prop)
	const { data, error, isValidating } = useSWR(
		() => (isEmpty(nodeId) ? null : `/api/weather-station/${nodeId}`),
		(url) =>
			apiClient(
				{
					method: 'GET',
					url,
				},
				session?.accessToken,
			),
	);

	/**
	 * Form initial values
	 */
	const initialValues: NodeFormDtoIn = {
		name: data?.data?.name ?? '',
		secret: data?.data?.secret ?? '',
	};

	/**
	 * Form submit handler
	 * @param {NodeFormDtoIn} values
	 * @param {(field: string, message: (string | undefined)) => void} setFieldError
	 * @return {Promise<void>}
	 */
	const submitHandler: FormikConfig<typeof initialValues>['onSubmit'] = async (values, { setFieldError, setStatus }) => {
		setStatus(null);
		const inputData = values;

		try {
			if (!isEmpty(nodeId)) {
				// update topic
				const { data: response } = await apiClient(
					{
						method: 'PUT',
						url: `/api/weather-station/${nodeId}`,
						data: inputData,
					},
					session?.accessToken,
				);
				setStatus({
					severity: 'success',
					children: translate(TRANSLATIONS.GENERAL.updateSuccess),
				});

				// call onSubmitted callback
				return onSubmitted?.(response._id);
			} else {
				// create topic
				const { data: response } = await apiClient(
					{
						method: 'POST',
						url: `/api/weather-station`,
						data: inputData,
					},
					session?.accessToken,
				);

				// call onSubmitted callback
				return onSubmitted?.(response._id);
			}
		} catch (exception: Error | any) {
			switch (exception.name) {
				default: {
					setStatus(exception.message);
					break;
				}
			}
		}
	};

	// display error alert when error occurs
	if (!isEmpty(nodeId) && isDefined(error)) {
		return (
			<Alert severity="error">
				<AlertTitle>{translate(TRANSLATIONS.ERRORS.loading)}</AlertTitle>
				<pre>{JSON.stringify(error, null, 2)}</pre>
			</Alert>
		);
	}

	return (
		<Formik initialValues={initialValues} enableReinitialize validationSchema={schema} onSubmit={submitHandler}>
			{({ isSubmitting, isValid, dirty, values, errors, setFieldValue }) => (
				<Grid container component={FormikWrapper} spacing={3} processing={isSubmitting || isValidating} pt={2}>
					{/* name */}
					<Grid item xs={12}>
						<FormikFieldMui
							FieldInput={TextField}
							fullWidth
							label={translate(TRANSLATIONS.NODE_FORM.name)}
							type="text"
							name="name"
							variant="outlined"
						/>
					</Grid>

					{/* secret */}
					<Grid item xs={12}>
						<FormikFieldMui
							FieldInput={TextField}
							fullWidth
							label={translate(TRANSLATIONS.NODE_FORM.secret)}
							type="password"
							name="secret"
							variant="outlined"
						/>
					</Grid>

					{/* submit button */}
					<Grid item xs={12}>
						<LoadingButton loading={isSubmitting} type="submit" fullWidth variant="contained" color="primary" size="large">
							{translate(isEmpty(nodeId) ? TRANSLATIONS.NODE_FORM.create : TRANSLATIONS.NODE_FORM.update)}
						</LoadingButton>
					</Grid>
				</Grid>
			)}
		</Formik>
	);
};

/**
 * NodeForm schema
 */
const schema = Yup.object().shape<NodeFormDtoIn>({
	name: Yup.string().required(),
	secret: Yup.string().required(),
});

/**
 * NodeForm data type
 */
export type NodeFormDtoIn = { name: string; secret: string };

/**
 * NodeForm component props
 */
export type NodeFormProps = {
	nodeId?: string;
	onSubmitted?: (weatherStation: any) => void;
};

/**
 * Component default export
 */
export default NodeForm;
