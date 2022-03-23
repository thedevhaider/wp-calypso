import { Button } from '@automattic/components';
import { Icon } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import SelectVertical from 'calypso/components/select-vertical';
import { tip } from '../../icons';
import './site-vertical.scss';

interface Props {
	defaultVertical: string;
	onSubmit: ( vertical: string ) => void;
}

const SiteVertical: React.FC< Props > = ( { defaultVertical, onSubmit } ) => {
	const translate = useTranslate();
	const [ vertical, setVertical ] = React.useState( defaultVertical );

	const onSelect = ( value: string ) => {
		setVertical( value );
	};

	const handleSubmit = ( event: React.FormEvent ) => {
		event.preventDefault();
		onSubmit( vertical );
	};

	return (
		<form className="site-vertical__form" onSubmit={ handleSubmit }>
			<FormFieldset className="site-vertical__form-fieldset">
				<SelectVertical selectedVertical={ vertical } onSelect={ onSelect } />
				<FormSettingExplanation>
					<Icon className="site-vertical__form-icon" icon={ tip } size={ 20 } />
					{ translate( 'We will use this information to guide you towards next steps.' ) }
				</FormSettingExplanation>
			</FormFieldset>
			<Button className="site-vertical__submit-button" type="submit" primary>
				{ translate( 'Continue' ) }
			</Button>
		</form>
	);
};

export default SiteVertical;
