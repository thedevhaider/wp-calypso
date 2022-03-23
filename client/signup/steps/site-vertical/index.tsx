import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { useDispatch } from 'react-redux';
import siteVerticalImage from 'calypso/assets/images/onboarding/site-vertical.svg';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import StepWrapper from 'calypso/signup/step-wrapper';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';
import SiteVertical from './site-vertical';
import './index.scss';

interface Props {
	goToNextStep: () => void;
	isReskinned: boolean;
	signupDependencies: any;
	stepName: string;
	initialContext: any;
}

export default function SiteVerticalStep( props: Props ): React.ReactNode {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const { stepName, signupDependencies, goToNextStep } = props;
	const headerText = translate( 'What’s your website about?' );
	const subHeaderText = translate( 'Choose a category that defines your website the best.' );

	const submitSiteVertical = ( vertical: string ) => {
		recordTracksEvent( 'calypso_signup_site_vertical_submit', {
			vertical,
		} );
		dispatch( submitSignupStep( { stepName }, { vertical } ) );
		goToNextStep();
	};

	// Only do following things when mounted
	React.useEffect( () => {
		dispatch( saveSignupStep( { stepName } ) );
	}, [] );

	return (
		<StepWrapper
			headerText={ headerText }
			fallbackHeaderText={ headerText }
			subHeaderText={ subHeaderText }
			fallbackSubHeaderText={ subHeaderText }
			headerImageUrl={ siteVerticalImage }
			stepContent={
				<SiteVertical
					defaultVertical={ signupDependencies.vertical }
					onSubmit={ submitSiteVertical }
				/>
			}
			align={ 'left' }
			skipButtonAlign={ 'top' }
			/** TODO: Handle skip to My Home */
			skipLabelText={ translate( 'Skip to My Home' ) }
			isHorizontalLayout={ true }
			{ ...props }
		/>
	);
}
