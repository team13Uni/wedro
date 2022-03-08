import { Alert, AlertProps, Grid } from '@mui/material';
import { BackdropOverlay } from '@wedro/components';
import { isDefined } from '@wedro/utils';
import { Form, FormikFormProps, useFormikContext } from 'formik';
import React, { useEffect, useState } from 'react';

/**
 * Formik wrapper component
 * @return {JSX.Element}
 * @constructor
 */
export const FormikWrapper: React.FC<FormikWrapperProps> = ({ processing = false, alert: inputAlert, children, ...props }) => {
	const { status } = useFormikContext();
	const [alert, setAlert] = useState<AlertProps | null>(null);

	// alert via input alert
	useEffect(() => {
		if (typeof inputAlert !== 'undefined') setAlert(inputAlert);
	}, [inputAlert]);

	// update alert on status change
	useEffect(() => {
		if (isDefined(status)) {
			if (typeof status === 'string') setAlert({ severity: 'error', children: status });
			else if (isDefined(status.children)) setAlert(status);
		}
	}, [status]);

	return (
		<BackdropOverlay open={processing}>
			<Form style={{ opacity: processing ? 0.5 : 1, pointerEvents: processing ? 'none' : 'initial' }} {...props}>
				{/* alert */}
				{isDefined(alert) && (
					<Grid item container xs={12} mb={2}>
						<Grid item xs={12} component={Alert} {...alert} />
					</Grid>
				)}

				{/* form children */}
				{children}
			</Form>
		</BackdropOverlay>
	);
};

/**
 * Formik wrapper component props interface
 * @export
 */
export interface FormikWrapperProps extends FormikFormProps {
	processing?: boolean;
	alert?: AlertProps | null;
}
