import { Button } from '@automattic/components';
import { Icon } from '@wordpress/icons';
import { TranslateResult, useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import * as React from 'react';
import { connect } from 'react-redux';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import SelectVertical from 'calypso/components/select-vertical';
import { setSiteVertical } from 'calypso/state/signup/steps/site-vertical/actions';
import { getSiteVerticalName } from 'calypso/state/signup/steps/site-vertical/selectors';
import { tip } from '../../icons';
import './site-vertical.scss';

interface Props {
	searchTerm: string;
	isSkipSynonyms?: boolean;
	onSubmit: ( vertical: string ) => void;
	setSiteVertical: ( { name: string } ) => void;
}

const SiteVertical: React.FC< Props > = ( {
	searchTerm,
	isSkipSynonyms,
	onSubmit,
	setSiteVertical,
} ) => {
	const translate = useTranslate();

	const handleVerticalInputChange = useCallback(
		( value: TranslateResult | string ) => {
			setSiteVertical( { name: value } );
		},
		[ setSiteVertical ]
	);

	const handleSubmit = ( event: React.FormEvent ) => {
		event.preventDefault();
		onSubmit( searchTerm );
	};

	return (
		<form className="site-vertical__form" onSubmit={ handleSubmit }>
			<FormFieldset className="site-vertical__form-fieldset">
				<SelectVertical
					searchTerm={ searchTerm }
					isSkipSynonyms={ isSkipSynonyms }
					onInputChange={ handleVerticalInputChange }
					autoFocus={ '' === searchTerm } // eslint-disable-line jsx-a11y/no-autofocus
				/>
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

export default connect(
	( state ) => ( {
		searchTerm: getSiteVerticalName( state ) || '',
	} ),
	{
		setSiteVertical,
	}
)( SiteVertical );
