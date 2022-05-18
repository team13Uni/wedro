import { Add, ErrorOutline } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Alert, AlertTitle, Autocomplete, CircularProgress, Dialog, DialogContent, DialogTitle, Grid, IconButton, TextField } from '@mui/material';
import { apiClient } from '@wedro/app';
import { FormikFieldMui, FormikWrapper } from '@wedro/components';
import NodeForm from '@wedro/components/form/NodeForm';
import { TRANSLATIONS } from '@wedro/constants';
import { useTranslate } from '@wedro/hooks';
import { isDefined, isEmpty } from '@wedro/utils';
import { Formik, FormikConfig } from 'formik';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { FunctionComponent, useState } from 'react';
import useSWR from 'swr';
import * as Yup from 'yup';

/**
 * LocationForm component
 * @return {JSX.Element}
 * @constructor
 */
const LocationForm: FunctionComponent<LocationFormProps> = ({ locationId, onSubmitted }) => {
	const router = useRouter();
	const { data: session, status } = useSession({ required: true });
	const [nodeDialog, setNodeDialog] = useState<string | null>(null);
	const { translate } = useTranslate();

	// fetch location info when editing (provided `locationId` prop)
	const { data, error, isValidating, mutate } = useSWR(
		() => (isEmpty(locationId) ? null : `/api/location/${locationId}`),
		(url) =>
			apiClient(
				{
					method: 'GET',
					url,
				},
				session?.accessToken,
			),
	);

	// fetch all nodes
	const {
		data: nodesRawData,
		error: nodeError,
		isValidating: nodeValidating,
		mutate: nodeMutate,
	} = useSWR(
		() => `/api/weather-station`,
		(url) =>
			apiClient(
				{
					method: 'GET',
					url,
				},
				session?.accessToken,
			),
	);
	const nodes = nodesRawData?.data || [];

	/**
	 * Form initial values
	 */
	const initialValues: LocationFormDtoIn = {
		name: data?.data.name || '',
		lat: data?.data?.coordinates?.[0]?.toString() ?? '14.5107035',
		lng: data?.data?.coordinates?.[1]?.toString() ?? '50.1090332',
		seaLevel: data?.data.seaLevel || 0,
		nodeId: data?.data?.weatherStation?._id || '',
	};

	/**
	 * Form submit handler
	 * @param {LocationFormDtoIn} values
	 * @param {(field: string, message: (string | undefined)) => void} setFieldError
	 * @return {Promise<void>}
	 */
	const submitHandler: FormikConfig<typeof initialValues>['onSubmit'] = async (values, { setFieldError, setStatus }) => {
		setStatus(null);
		console.log(values);
		const inputData = {
			name: values.name,
			coordinates: [Number(values.lat), Number(values.lng)],
			seaLevel: values.seaLevel,
			nodeId: isEmpty(values.nodeId) ? undefined : values.nodeId,
		};

		try {
			if (!isEmpty(locationId)) {
				// update topic
				const { data } = await apiClient(
					{
						method: 'PUT',
						url: `/api/location/${locationId}`,
						data: inputData,
					},
					session?.accessToken,
				);
				setStatus({
					severity: 'success',
					children: translate(TRANSLATIONS.GENERAL.updateSuccess),
				});

				// call onSubmitted callback
				onSubmitted?.(data?.data);
			} else {
				// create topic
				const { data } = await apiClient(
					{
						method: 'POST',
						url: `/api/location`,
						data: inputData,
					},
					session?.accessToken,
				);

				// call onSubmitted callback
				onSubmitted?.(data?.data);
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
	if (!isEmpty(locationId) && isDefined(error)) {
		return (
			<Alert severity="error">
				<AlertTitle>{translate(TRANSLATIONS.ERRORS.loading)}</AlertTitle>
				<pre>{JSON.stringify(error, null, 2)}</pre>
			</Alert>
		);
	}

	return (
		<React.Fragment>
			<Formik initialValues={initialValues} enableReinitialize validationSchema={schema} onSubmit={submitHandler}>
				{({ isSubmitting, isValid, dirty, values, errors, setFieldValue }) => (
					<Grid container component={FormikWrapper} spacing={3} processing={isSubmitting || isValidating} pt={2}>
						{/* name */}
						<Grid item xs={12}>
							<FormikFieldMui
								FieldInput={TextField}
								fullWidth
								label={translate(TRANSLATIONS.LOCATION_FORM.name)}
								type="text"
								name="name"
								variant="outlined"
							/>
						</Grid>

						<Grid item container spacing={2} xs={12}>
							<Grid item xs={12} lg={6}>
								<FormikFieldMui
									FieldInput={TextField}
									fullWidth
									label={translate(TRANSLATIONS.LOCATION_FORM.lat)}
									type="text"
									name="lat"
									variant="outlined"
								/>
							</Grid>

							<Grid item xs={12} lg={6}>
								<FormikFieldMui
									FieldInput={TextField}
									fullWidth
									label={translate(TRANSLATIONS.LOCATION_FORM.lng)}
									type="text"
									name="lng"
									variant="outlined"
								/>
							</Grid>
						</Grid>

						<Grid item xs={12}>
							<FormikFieldMui
								FieldInput={TextField}
								fullWidth
								label={translate(TRANSLATIONS.LOCATION_FORM.seaLevel)}
								type="text"
								name="seaLevel"
								variant="outlined"
							/>
						</Grid>

						<Grid item container xs={12} spacing={2}>
							<Grid item xs={10}>
								<Autocomplete
									key={values.nodeId}
									isOptionEqualToValue={(option, value) => option._id === value._id}
									getOptionLabel={(option) => option.name}
									options={nodes || []}
									loading={nodeValidating}
									getOptionDisabled={(option) => option.hasLocation && option._id !== data?.data?.weatherStation?._id}
									/* @ts-ignore */
									value={nodes?.find(({ _id }) => values.nodeId === _id)}
									onChange={(_, guarantor) => setFieldValue('nodeId', guarantor?._id)}
									renderInput={(params) => (
										<FormikFieldMui
											{...params}
											FieldInput={TextField}
											label={translate(TRANSLATIONS.LOCATION_FORM.nodeId)}
											type="text"
											name="nodeId"
											variant="outlined"
											InputProps={{
												...params.InputProps,
												endAdornment: (
													<React.Fragment>
														{nodeValidating ? <CircularProgress color="inherit" size={20} /> : nodeError ? <ErrorOutline /> : null}
														{params.InputProps.endAdornment}
													</React.Fragment>
												),
											}}
										/>
									)}
								/>
							</Grid>
							<Grid item xs={2}>
								<IconButton onClick={() => setNodeDialog('')}>
									<Add />
								</IconButton>
							</Grid>
						</Grid>

						{/* submit button */}
						<Grid item xs={12}>
							<LoadingButton loading={isSubmitting} type="submit" fullWidth variant="contained" color="primary" size="large">
								{translate(isEmpty(locationId) ? TRANSLATIONS.LOCATION_FORM.create : TRANSLATIONS.LOCATION_FORM.update)}
							</LoadingButton>
						</Grid>

						{/* node form */}
						<Dialog onClose={() => setNodeDialog(null)} open={isDefined(nodeDialog)} fullWidth>
							{isDefined(nodeDialog) && (
								<>
									<DialogTitle>
										{translate(isEmpty(nodeDialog) ? TRANSLATIONS.NODE_FORM.createTitle : TRANSLATIONS.NODE_FORM.updateTitle)}
									</DialogTitle>
									<DialogContent>
										<NodeForm
											nodeId={nodeDialog}
											onSubmitted={async (nodeId) => {
												setNodeDialog(null);
												await router.replace(router.asPath);
												await nodeMutate();
												setFieldValue('nodeId', nodeId);
											}}
										/>
									</DialogContent>
								</>
							)}
						</Dialog>
					</Grid>
				)}
			</Formik>
		</React.Fragment>
	);
};

/**
 * LocationForm schema
 */
const schema = Yup.object().shape<LocationFormDtoIn>({
	name: Yup.string().required(),
	lat: Yup.string().required(),
	lng: Yup.string().required(),
	seaLevel: Yup.number().required(),
	nodeId: Yup.string(),
});

/**
 * LocationForm data type
 */
export type LocationFormDtoIn = { name: string; lat: string; lng: string; seaLevel: number; nodeId: string };

/**
 * LocationForm component props
 */
export type LocationFormProps = {
	locationId?: string;
	onSubmitted?: (location: any) => void;
};

/**
 * Component default export
 */
export default LocationForm;
