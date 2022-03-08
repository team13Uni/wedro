import { TextFieldProps as MuiTextFieldProps } from '@mui/material';
import { isDefined, isEmpty } from '@wedro/utils';
import { useFormikContext } from 'formik';
import { get } from 'lodash';
import React, { PropsWithChildren } from 'react';

/**
 * Returns Material-UI input component with connected formik props and handlers
 * @return {JSX.Element}
 * @constructor
 */
export const FormikFieldMui: React.FC<FormikFieldMuiProps> = ({ FieldInput, transformValue, ...props }) => {
	const { values, touched, errors, handleChange } = useFormikContext<any>();

	/**
	 * onChange handler with implementation of value transformation
	 * @param {React.ChangeEvent<any>} e
	 */
	const onChange = (e: React.ChangeEvent<any>): void => {
		if (isDefined(transformValue)) {
			if (isDefined(e.target.value)) e.target.value = transformValue(e.target.value);
			if (isDefined(e.currentTarget.value)) e.currentTarget.value = transformValue(e.currentTarget.value);
		}
		handleChange(e);
	};

	return (
		<FieldInput
			value={get(values, props.name)}
			onChange={onChange}
			error={get(touched, props.name) && !isEmpty(get(errors, props.name))}
			helperText={get(touched, props.name) && get(errors, props.name)}
			{...props}
		/>
	);
};

/**
 * FormikFieldMui properties interface
 * @export
 */
export interface FormikFieldMuiProps extends Omit<MuiTextFieldProps, 'name'> {
	FieldInput: (props: PropsWithChildren<any>) => JSX.Element;
	transformValue?: (value?: string | null | number) => string | number;
	name: string;
}
