import styled from '@emotion/styled';
import { useI18n } from '@wordpress/react-i18n';
import debugFactory from 'debug';
import PropTypes from 'prop-types';
import {
	cloneElement,
	Children,
	useCallback,
	useContext,
	useEffect,
	useState,
	createContext,
} from 'react';
import { getDefaultPaymentMethodStep } from '../components/default-steps';
import CheckoutContext from '../lib/checkout-context';
import { useFormStatus } from '../lib/form-status';
import joinClasses from '../lib/join-classes';
import { usePaymentMethod } from '../lib/payment-methods';
import { FormStatus, CheckoutStepProps } from '../types';
import Button from './button';
import CheckoutErrorBoundary from './checkout-error-boundary';
import CheckoutNextStepButton from './checkout-next-step-button';
import CheckoutSubmitButton from './checkout-submit-button';
import LoadingContent from './loading-content';
import { CheckIcon } from './shared-icons';
import { useCustomPropertyForHeight } from './use-custom-property-for-height';
import type { Theme } from '../lib/theme';
import type { Dispatch, ReactNode, HTMLAttributes, SetStateAction, ReactElement } from 'react';

const debug = debugFactory( 'composite-checkout:checkout-steps' );

const customPropertyForSubmitButtonHeight = '--submit-button-height';

interface StepCompleteStatus {
	[ key: string ]: boolean;
}

interface CheckoutStepDataContext {
	activeStepNumber: number;
	stepCompleteStatus: StepCompleteStatus;
	totalSteps: number;
	setActiveStepNumber: ( stepNumber: number ) => void;
	setStepCompleteStatus: Dispatch< SetStateAction< StepCompleteStatus > >;
	setTotalSteps: ( totalSteps: number ) => void;
}

interface CheckoutSingleStepDataContext {
	stepNumber: number;
	nextStepNumber: number | null;
	isStepActive: boolean;
	isStepComplete: boolean;
	areStepsActive: boolean;
}

const CheckoutStepDataContext = createContext< CheckoutStepDataContext >( {
	activeStepNumber: 0,
	stepCompleteStatus: {},
	totalSteps: 0,
	setActiveStepNumber: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
	setStepCompleteStatus: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
	setTotalSteps: () => {}, // eslint-disable-line @typescript-eslint/no-empty-function
} );

const CheckoutSingleStepDataContext = createContext< CheckoutSingleStepDataContext >( {
	stepNumber: 0,
	nextStepNumber: null,
	isStepActive: false,
	isStepComplete: false,
	areStepsActive: false,
} );

const CheckoutWrapper = styled.div`
	*:focus {
		outline: ${ ( props ) => props.theme.colors.outline } solid 2px;
	}
`;

export const MainContentWrapper = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		margin: 0 auto 32px;
	}

	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		align-items: flex-start;
		flex-direction: row;
		justify-content: center;
		max-width: none;
	}
`;

const CheckoutSummary = styled.div`
	box-sizing: border-box;
	margin: 0 auto;
	width: 100%;

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		max-width: 556px;
	}

	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		margin-right: 0;
		margin-left: 24px;
		order: 2;
		width: 328px;

		.rtl & {
			margin-right: 24px;
			margin-left: 0;
		}
	}
`;

export const CheckoutSummaryArea = ( {
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
} ): JSX.Element => {
	return (
		<CheckoutSummary className={ joinClasses( [ className, 'checkout__summary-area' ] ) }>
			{ children }
		</CheckoutSummary>
	);
};

export const CheckoutSummaryCard = styled.div`
	background: ${ ( props ) => props.theme.colors.surface };
	border-bottom: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };

	@media ( ${ ( props ) => props.theme.breakpoints.smallPhoneUp } ) {
		border: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
		border-bottom: none 0;
	}

	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		border: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
	}
`;

function isElementAStep( el: ReactNode ): boolean {
	const childStep = el as { type?: { isCheckoutStep?: boolean } };
	return !! childStep?.type?.isCheckoutStep;
}

function isNodeAComponent( el: ReactNode ): el is ReactElement {
	const childStep = el as ReactElement;
	return childStep?.props !== undefined;
}

export const CheckoutSteps = ( {
	children,
	areStepsActive = true,
}: CheckoutStepsProps ): JSX.Element => {
	let stepNumber = 0;
	let nextStepNumber: number | null = 1;

	const childrenArray = Children.toArray( children );
	const steps = childrenArray.filter( isElementAStep );
	const totalSteps = steps.length;
	const { activeStepNumber, stepCompleteStatus, setTotalSteps } = useContext(
		CheckoutStepDataContext
	);

	useEffect( () => {
		setTotalSteps( totalSteps );
	}, [ totalSteps, setTotalSteps ] );

	debug(
		'active step',
		activeStepNumber,
		'step complete status',
		stepCompleteStatus,
		'total steps',
		totalSteps
	);

	return (
		<>
			{ childrenArray.map( ( child, childNumber ) => {
				if ( ! isNodeAComponent( child ) ) {
					return child;
				}
				if ( isElementAStep( child ) ) {
					stepNumber = nextStepNumber || 0;
					nextStepNumber = stepNumber === totalSteps ? null : stepNumber + 1;
					const isStepActive = areStepsActive && activeStepNumber === stepNumber;
					const isStepComplete = !! stepCompleteStatus[ stepNumber ];
					return (
						<CheckoutSingleStepDataContext.Provider
							key={ 'checkout-step-' + stepNumber }
							value={ {
								stepNumber,
								nextStepNumber,
								isStepActive,
								isStepComplete,
								areStepsActive,
							} }
						>
							{ child }
						</CheckoutSingleStepDataContext.Provider>
					);
				}
				// Provide a `key` prop
				return cloneElement( child, { key: 'checkout-non-step-' + childNumber } );
			} ) }
		</>
	);
};

interface CheckoutStepsProps {
	children?: ReactNode;
	areStepsActive?: boolean;
}

export function Checkout( {
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
} ): JSX.Element {
	const { isRTL } = useI18n();
	const { formStatus } = useFormStatus();
	const [ activeStepNumber, setActiveStepNumber ] = useState< number >( 1 );
	const [ stepCompleteStatus, setStepCompleteStatus ] = useState< StepCompleteStatus >( {} );
	const [ totalSteps, setTotalSteps ] = useState( 0 );
	const actualActiveStepNumber =
		activeStepNumber > totalSteps && totalSteps > 0 ? totalSteps : activeStepNumber;

	// Change the step if the url changes
	useChangeStepNumberForUrl( setActiveStepNumber );

	// Note: the composite-checkout class name is also used by FullStory to avoid recording
	// WordPress.com checkout session activity. If this class name is changed or removed, we
	// will also need to adjust this FullStory configuration.
	const classNames = joinClasses( [
		'composite-checkout',
		...( className ? [ className ] : [] ),
		...( isRTL() ? [ 'rtl' ] : [] ),
	] );

	if ( formStatus === FormStatus.LOADING ) {
		return (
			<CheckoutWrapper className={ classNames }>
				<MainContentWrapper className={ joinClasses( [ className, 'checkout__content' ] ) }>
					<LoadingContent />
				</MainContentWrapper>
			</CheckoutWrapper>
		);
	}

	return (
		<CheckoutWrapper className={ classNames }>
			<MainContentWrapper className={ joinClasses( [ className, 'checkout__content' ] ) }>
				<CheckoutStepDataContext.Provider
					value={ {
						activeStepNumber: actualActiveStepNumber,
						stepCompleteStatus,
						totalSteps,
						setActiveStepNumber,
						setStepCompleteStatus,
						setTotalSteps,
					} }
				>
					{ children }
				</CheckoutStepDataContext.Provider>
			</MainContentWrapper>
		</CheckoutWrapper>
	);
}

export const CheckoutStep = ( {
	activeStepContent,
	activeStepFooter,
	completeStepContent,
	titleContent,
	stepId,
	className,
	isCompleteCallback,
	editButtonText,
	editButtonAriaLabel,
	nextStepButtonText,
	nextStepButtonAriaLabel,
	validatingButtonText,
	validatingButtonAriaLabel,
}: CheckoutStepProps ): JSX.Element => {
	const { __ } = useI18n();
	const { setActiveStepNumber, setStepCompleteStatus, stepCompleteStatus } = useContext(
		CheckoutStepDataContext
	);
	const { stepNumber, nextStepNumber, isStepActive, isStepComplete, areStepsActive } = useContext(
		CheckoutSingleStepDataContext
	);
	const { onPageLoadError, onStepChanged } = useContext( CheckoutContext );
	const { formStatus, setFormValidating, setFormReady } = useFormStatus();
	const setThisStepCompleteStatus = ( newStatus: boolean ) =>
		setStepCompleteStatus( { ...stepCompleteStatus, [ stepNumber ]: newStatus } );
	const goToThisStep = () => setActiveStepNumber( stepNumber );
	const activePaymentMethod = usePaymentMethod();
	const finishIsCompleteCallback = ( completeResult: boolean ) => {
		setThisStepCompleteStatus( !! completeResult );
		if ( completeResult ) {
			onStepChanged?.( {
				stepNumber: nextStepNumber,
				previousStepNumber: stepNumber,
				paymentMethodId: activePaymentMethod?.id ?? '',
			} );
			if ( nextStepNumber ) {
				saveStepNumberToUrl( nextStepNumber );
				setActiveStepNumber( nextStepNumber );
			}
		}
		setFormReady();
	};
	const goToNextStep = async () => {
		// Wrapping this in Promise.resolve allows it to be a Promise or boolean
		const completeResult = Promise.resolve( isCompleteCallback() );
		setFormValidating();
		const delayedCompleteResult = await completeResult;
		debug( `isCompleteCallback for step ${ stepNumber } finished with`, delayedCompleteResult );
		finishIsCompleteCallback( delayedCompleteResult );
	};

	const classNames = [
		'checkout-step',
		...( isStepActive ? [ 'is-active' ] : [] ),
		...( isStepComplete ? [ 'is-complete' ] : [] ),
		...( className ? [ className ] : [] ),
	];

	const onError = useCallback(
		( error ) => onPageLoadError?.( 'step_load', error, { step_id: stepId } ),
		[ onPageLoadError, stepId ]
	);

	return (
		<CheckoutStepBody
			onError={ onError }
			editButtonText={ editButtonText || __( 'Edit' ) }
			editButtonAriaLabel={ editButtonAriaLabel || __( 'Edit this step' ) }
			nextStepButtonText={ nextStepButtonText || __( 'Continue' ) }
			nextStepButtonAriaLabel={ nextStepButtonAriaLabel || __( 'Continue to the next step' ) }
			validatingButtonText={ validatingButtonText || __( 'Please wait…' ) }
			validatingButtonAriaLabel={ validatingButtonAriaLabel || __( 'Please wait…' ) }
			isStepActive={ isStepActive }
			isStepComplete={ isStepComplete }
			stepNumber={ stepNumber }
			stepId={ stepId }
			titleContent={ titleContent }
			goToThisStep={ areStepsActive ? goToThisStep : undefined }
			goToNextStep={ nextStepNumber && nextStepNumber > 0 ? goToNextStep : undefined }
			activeStepContent={
				<>
					{ activeStepContent }
					{ activeStepFooter }
				</>
			}
			formStatus={ formStatus }
			completeStepContent={ completeStepContent }
			className={ joinClasses( classNames ) }
		/>
	);
};
CheckoutStep.isCheckoutStep = true;

export const CheckoutStepAreaWrapper = styled.div`
	background: ${ ( props ) => props.theme.colors.surface };
	box-sizing: border-box;
	margin: 0 auto;
	width: 100%;

	&.checkout__step-wrapper--last-step {
		margin-bottom: var( ${ customPropertyForSubmitButtonHeight }, 100px );
	}

	@media ( ${ ( props ) => props.theme.breakpoints.smallPhoneUp } ) {
		border: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
	}

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		max-width: 556px;
		margin-bottom: 0;
	}

	@media ( ${ ( props ) => props.theme.breakpoints.desktopUp } ) {
		margin: 0;
		order: 1;
		width: 556px;
	}
`;

export const SubmitButtonWrapper = styled.div`
	background: ${ ( props ) => props.theme.colors.background };
	padding: 24px;
	bottom: 0;
	left: 0;
	box-sizing: border-box;
	width: 100%;
	z-index: 10;
	border-top-width: 0;
	border-top-style: solid;
	border-top-color: ${ ( props ) => props.theme.colors.borderColorLight };

	.checkout__step-wrapper--last-step & {
		border-top-width: 1px;
		position: fixed;
	}

	.rtl & {
		right: 0;
		left: auto;
	}

	.checkout-button {
		width: calc( 100% - 60px );
		margin: 0 auto;
	}

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		.checkout-button {
			width: 100%;
		}

		.checkout__step-wrapper--last-step & {
			position: relative;
			border: 0;
		}
	}
`;

// Set right padding so that text doesn't overlap with inline help floating button.
export const SubmitFooterWrapper = styled.div`
	padding-right: 42px;

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		padding-right: 0;
	}
`;

export function CheckoutStepArea( {
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
} ): JSX.Element {
	const { activeStepNumber, totalSteps } = useContext( CheckoutStepDataContext );
	const actualActiveStepNumber =
		activeStepNumber > totalSteps && totalSteps > 0 ? totalSteps : activeStepNumber;
	const isThereAnotherNumberedStep = actualActiveStepNumber < totalSteps;

	const classNames = joinClasses( [
		'checkout__step-wrapper',
		...( className ? [ className ] : [] ),
		...( ! isThereAnotherNumberedStep ? [ 'checkout__step-wrapper--last-step' ] : [] ),
	] );

	return <CheckoutStepAreaWrapper className={ classNames }>{ children }</CheckoutStepAreaWrapper>;
}

export function CheckoutFormSubmit( {
	submitButtonHeader,
	submitButtonFooter,
	disableSubmitButton,
}: {
	submitButtonHeader?: ReactNode;
	submitButtonFooter?: ReactNode;
	disableSubmitButton?: boolean;
} ): JSX.Element {
	const { activeStepNumber, totalSteps } = useContext( CheckoutStepDataContext );
	const actualActiveStepNumber =
		activeStepNumber > totalSteps && totalSteps > 0 ? totalSteps : activeStepNumber;
	const isThereAnotherNumberedStep = actualActiveStepNumber < totalSteps;
	const { onPageLoadError } = useContext( CheckoutContext );
	const onSubmitButtonLoadError = useCallback(
		( error ) => onPageLoadError?.( 'submit_button_load', error ),
		[ onPageLoadError ]
	);

	const submitWrapperRef = useCustomPropertyForHeight< HTMLDivElement >(
		customPropertyForSubmitButtonHeight
	);

	return (
		<SubmitButtonWrapper className="checkout-steps__submit-button-wrapper" ref={ submitWrapperRef }>
			{ submitButtonHeader || null }
			<CheckoutSubmitButton
				disabled={ isThereAnotherNumberedStep || disableSubmitButton }
				onLoadError={ onSubmitButtonLoadError }
			/>
			<SubmitFooterWrapper>{ submitButtonFooter || null }</SubmitFooterWrapper>
		</SubmitButtonWrapper>
	);
}

const StepWrapper = styled.div< HTMLAttributes< HTMLDivElement > >`
	position: relative;
	border-bottom: 1px solid ${ ( props ) => props.theme.colors.borderColorLight };
	padding: 16px;

	&.checkout-step {
		background: ${ ( props ) => props.theme.colors.background };
	}

	&.checkout-step.is-active,
	&.checkout-step.is-complete {
		background: ${ ( props ) => props.theme.colors.surface };
	}

	@media ( ${ ( props ) => props.theme.breakpoints.tabletUp } ) {
		padding: 24px;
	}
`;

const StepContentWrapper = styled.div< StepContentWrapperProps & HTMLAttributes< HTMLDivElement > >`
	color: ${ ( props ) => props.theme.colors.textColor };
	display: ${ ( props ) => ( props.isVisible ? 'block' : 'none' ) };
	padding-left: 35px;

	.rtl & {
		padding-right: 35px;
		padding-left: 0;
	}
`;

interface StepContentWrapperProps {
	isVisible?: boolean;
}

const StepSummaryWrapper = styled.div< StepContentWrapperProps & HTMLAttributes< HTMLDivElement > >`
	color: ${ ( props ) => props.theme.colors.textColorLight };
	font-size: 14px;
	display: ${ ( props ) => ( props.isVisible ? 'block' : 'none' ) };
	padding-left: 35px;

	.rtl & {
		padding-right: 35px;
		padding-left: 0;
	}
`;

export function CheckoutStepBody( {
	errorMessage,
	editButtonText,
	editButtonAriaLabel,
	nextStepButtonText,
	validatingButtonText,
	nextStepButtonAriaLabel,
	validatingButtonAriaLabel,
	isStepActive,
	isStepComplete,
	className,
	stepNumber,
	stepId,
	titleContent,
	goToThisStep,
	goToNextStep,
	activeStepContent,
	formStatus,
	completeStepContent,
	onError,
}: CheckoutStepBodyProps ): JSX.Element {
	const { __ } = useI18n();

	// Since both the active and inactive step content can be mounted at the same
	// time (by design so that both may hold state in form elements), these
	// test-ids can be used for tests to differentiate which version of a step is
	// currently visible.
	const activeStepTestId = isStepActive ? `${ stepId }--visible` : `${ stepId }--invisible`;
	const completeStepTestId = isStepActive ? `${ stepId }--invisible` : `${ stepId }--visible`;

	return (
		<CheckoutErrorBoundary
			errorMessage={ errorMessage || __( 'There was an error with this step.' ) }
			onError={ onError }
		>
			<StepWrapper className={ className }>
				<CheckoutStepHeader
					id={ stepId }
					stepNumber={ stepNumber }
					title={ titleContent }
					isActive={ isStepActive }
					isComplete={ isStepComplete }
					onEdit={
						formStatus === FormStatus.READY && isStepComplete && goToThisStep && ! isStepActive
							? goToThisStep
							: undefined
					}
					editButtonText={ editButtonText || __( 'Edit' ) }
					editButtonAriaLabel={ editButtonAriaLabel || __( 'Edit this step' ) }
				/>
				<StepContentWrapper
					data-testid={ activeStepTestId }
					isVisible={ isStepActive }
					className="checkout-steps__step-content"
				>
					{ activeStepContent }
					{ goToNextStep && isStepActive && (
						<CheckoutNextStepButton
							onClick={ goToNextStep }
							value={
								formStatus === FormStatus.VALIDATING
									? validatingButtonText || __( 'Please wait…' )
									: nextStepButtonText || __( 'Continue' )
							}
							ariaLabel={
								formStatus === FormStatus.VALIDATING
									? validatingButtonAriaLabel || __( 'Please wait…' )
									: nextStepButtonAriaLabel || __( 'Continue to next step' )
							}
							buttonType="primary"
							disabled={ formStatus !== FormStatus.READY }
							isBusy={ formStatus === FormStatus.VALIDATING }
						/>
					) }
				</StepContentWrapper>
				{ isStepComplete && completeStepContent ? (
					<StepSummaryWrapper
						data-testid={ completeStepTestId }
						isVisible={ ! isStepActive }
						className="checkout-steps__step-complete-content"
					>
						{ completeStepContent }
					</StepSummaryWrapper>
				) : null }
			</StepWrapper>
		</CheckoutErrorBoundary>
	);
}

interface CheckoutStepBodyProps {
	errorMessage?: string;
	onError?: ( message: string ) => void;
	editButtonAriaLabel?: string;
	editButtonText?: string;
	nextStepButtonText?: string;
	nextStepButtonAriaLabel?: string;
	isStepActive: boolean;
	isStepComplete: boolean;
	className?: string;
	stepNumber?: number;
	stepId: string;
	titleContent: ReactNode;
	goToThisStep?: () => void;
	goToNextStep?: () => void;
	activeStepContent?: ReactNode;
	formStatus?: FormStatus;
	completeStepContent?: ReactNode;
	validatingButtonText?: string;
	validatingButtonAriaLabel?: string;
}

CheckoutStepBody.propTypes = {
	errorMessage: PropTypes.string,
	onError: PropTypes.func,
	editButtonAriaLabel: PropTypes.string,
	editButtonText: PropTypes.string,
	nextStepButtonText: PropTypes.string,
	nextStepButtonAriaLabel: PropTypes.string,
	isStepActive: PropTypes.bool.isRequired,
	isStepComplete: PropTypes.bool.isRequired,
	className: PropTypes.string,
	stepNumber: PropTypes.number,
	stepId: PropTypes.string.isRequired,
	titleContent: PropTypes.node.isRequired,
	goToThisStep: PropTypes.func,
	goToNextStep: PropTypes.func,
	activeStepContent: PropTypes.node,
	formStatus: PropTypes.string,
	completeStepContent: PropTypes.node,
	validatingButtonText: PropTypes.string,
	validatingButtonAriaLabel: PropTypes.string,
};

export function useIsStepActive(): boolean {
	const { activeStepNumber } = useContext( CheckoutStepDataContext );
	const { stepNumber } = useContext( CheckoutSingleStepDataContext );
	return activeStepNumber === stepNumber;
}

export function useIsStepComplete(): boolean {
	const { stepCompleteStatus } = useContext( CheckoutStepDataContext );
	const { stepNumber } = useContext( CheckoutSingleStepDataContext );
	return !! stepCompleteStatus[ stepNumber ];
}

export function useSetStepComplete(): ( stepNumber: number, newStatus: boolean ) => void {
	const { setStepCompleteStatus } = useContext( CheckoutStepDataContext );
	const setTargetStepCompleteStatus = useCallback(
		( stepNumber: number, newStatus: boolean ) =>
			setStepCompleteStatus(
				( stepCompleteStatus: StepCompleteStatus ): StepCompleteStatus => ( {
					...stepCompleteStatus,
					[ stepNumber ]: newStatus,
				} )
			),
		[ setStepCompleteStatus ]
	);
	return setTargetStepCompleteStatus;
}

const StepTitle = styled.span< StepTitleProps & HTMLAttributes< HTMLSpanElement > >`
	color: ${ ( props ) =>
		props.isActive ? props.theme.colors.textColorDark : props.theme.colors.textColor };
	font-weight: ${ ( props ) =>
		props.isActive ? props.theme.weights.bold : props.theme.weights.normal };
	margin-right: ${ ( props ) => ( props.fullWidth ? '0' : '8px' ) };
	flex: 1;

	.rtl & {
		margin-right: 0;
		margin-left: ${ ( props ) => ( props.fullWidth ? '0' : '8px' ) };
	}
`;

interface StepTitleProps {
	isActive?: boolean;
	fullWidth?: boolean;
}

const StepHeader = styled.h2< StepHeaderProps & HTMLAttributes< HTMLHeadingElement > >`
	font-size: 16px;
	display: flex;
	width: 100%;
	align-items: center;
	margin: 0 0 ${ ( props ) => ( props.isComplete || props.isActive ? '8px' : '0' ) };
`;

interface StepHeaderProps {
	isComplete?: boolean;
	isActive?: boolean;
}

const HeaderEditButton = styled( Button )`
	font-size: 14px;
	padding-top: 1px;
`;

/* eslint-disable wpcalypso/jsx-classname-namespace */
function CheckoutStepHeader( {
	id,
	className,
	stepNumber,
	title,
	isActive,
	isComplete,
	onEdit,
	editButtonText,
	editButtonAriaLabel,
}: {
	id: string;
	className?: string;
	stepNumber?: number;
	title: ReactNode;
	isActive?: boolean;
	isComplete?: boolean;
	onEdit?: () => void;
	editButtonText?: string;
	editButtonAriaLabel?: string;
} ) {
	const { __ } = useI18n();
	const shouldShowEditButton = !! onEdit;

	return (
		<StepHeader
			isComplete={ isComplete }
			isActive={ isActive }
			className={ joinClasses( [ className, 'checkout-step__header' ] ) }
		>
			<Stepper isComplete={ isComplete } isActive={ isActive } id={ id }>
				{ stepNumber || null }
			</Stepper>
			<StepTitle fullWidth={ ! shouldShowEditButton } isActive={ isActive }>
				{ title }
			</StepTitle>
			{ shouldShowEditButton && (
				<HeaderEditButton
					className="checkout-step__edit-button"
					buttonType="text-button"
					onClick={ onEdit }
					aria-label={ editButtonAriaLabel || __( 'Edit this step' ) }
				>
					{ editButtonText || __( 'Edit' ) }
				</HeaderEditButton>
			) }
		</StepHeader>
	);
}

const StepNumberOuterWrapper = styled.div`
	position: relative;
	width: 27px;
	height: 27px;
	margin-right: 8px;

	.rtl & {
		margin-right: 0;
		margin-left: 8px;
	}
`;

const StepNumberInnerWrapper = styled.div<
	StepNumberInnerWrapperProps & HTMLAttributes< HTMLDivElement >
>`
	position: relative;
	transform-origin: center center;
	transition: transform 0.3s 0.1s ease-out;
	transform-style: preserve-3d;
	transform: ${ ( props ) => ( props.isComplete ? 'rotateY(180deg)' : 'rotateY(0)' ) };
`;

interface StepNumberInnerWrapperProps {
	isComplete?: boolean;
}

const StepNumber = styled.div< StepNumberProps & HTMLAttributes< HTMLDivElement > >`
	background: ${ getStepNumberBackgroundColor };
	font-weight: normal;
	width: 27px;
	height: 27px;
	line-height: 27px;
	box-sizing: border-box;
	text-align: center;
	border-radius: 50%;
	color: ${ getStepNumberForegroundColor };
	position: absolute;
	top: 0;
	left: 0;
	backface-visibility: hidden;

	.rtl & {
		right: 0;
		left: auto;
	}

	// Reason: The IE media query needs to not have spaces within brackets otherwise ie11 doesn't read them
	// prettier-ignore
	@media all and (-ms-high-contrast:none), (-ms-high-contrast:active) {
		z-index: ${ ( props ) => ( props.isComplete ? '0' : '1' ) };
	}
`;

interface StepNumberProps {
	isComplete?: boolean;
	isActive?: boolean;
}

const StepNumberCompleted = styled( StepNumber )`
	background: ${ ( props ) => props.theme.colors.success };
	transform: rotateY( 180deg );
	// Reason: media query needs to not have spaces within brackets otherwise ie11 doesn't read them
	// prettier-ignore
	@media all and (-ms-high-contrast:none), (-ms-high-contrast:active) {
		backface-visibility: visible;
		z-index: ${ ( props ) => ( props.isComplete ? '1' : '0' ) };
	}

	svg {
		margin-top: 4px;
	}
`;

CheckoutStepHeader.propTypes = {
	id: PropTypes.string,
	className: PropTypes.string,
	stepNumber: PropTypes.number,
	title: PropTypes.node.isRequired,
	isActive: PropTypes.bool,
	isComplete: PropTypes.bool,
	editButtonText: PropTypes.string,
	editButtonAriaLabel: PropTypes.string,
	onEdit: PropTypes.func,
};

function Stepper( {
	isComplete,
	isActive,
	className,
	children,
	id,
}: {
	id: string;
	className?: string;
	isComplete?: boolean;
	isActive?: boolean;
	children?: ReactNode;
} ) {
	// Prevent showing complete stepper when active
	const isCompleteAndInactive = isActive ? false : isComplete;
	return (
		<StepNumberOuterWrapper className={ joinClasses( [ className, 'checkout-step__stepper' ] ) }>
			<StepNumberInnerWrapper isComplete={ isCompleteAndInactive }>
				<StepNumber isComplete={ isCompleteAndInactive } isActive={ isActive }>
					{ children }
				</StepNumber>
				<StepNumberCompleted>
					<CheckIcon id={ id } />
				</StepNumberCompleted>
			</StepNumberInnerWrapper>
		</StepNumberOuterWrapper>
	);
}

Stepper.propTypes = {
	id: PropTypes.string,
	className: PropTypes.string,
	isComplete: PropTypes.bool,
	isActive: PropTypes.bool,
};

function getStepNumberBackgroundColor( {
	isComplete,
	isActive,
	theme,
}: {
	isComplete?: boolean;
	isActive?: boolean;
	theme: Theme;
} ) {
	if ( isActive ) {
		return theme.colors.highlight;
	}
	if ( isComplete ) {
		return theme.colors.success;
	}
	return theme.colors.upcomingStepBackground;
}

function getStepNumberForegroundColor( {
	isComplete,
	isActive,
	theme,
}: {
	isComplete?: boolean;
	isActive?: boolean;
	theme: Theme;
} ) {
	if ( isComplete || isActive ) {
		return theme.colors.surface;
	}
	return theme.colors.textColor;
}

function saveStepNumberToUrl( stepNumber: number ) {
	if ( ! window.history?.pushState ) {
		return;
	}
	const newHash = stepNumber > 1 ? `#step${ stepNumber }` : '';
	if ( window.location.hash === newHash ) {
		return;
	}
	const newUrl = window.location.hash
		? window.location.href.replace( window.location.hash, newHash )
		: window.location.href + newHash;
	debug( 'updating url to', newUrl );
	window.history.pushState( null, '', newUrl );
}

function getStepNumberFromUrl() {
	const hashValue = window.location?.hash;
	if ( hashValue?.startsWith?.( '#step' ) ) {
		const parts = hashValue.split( '#step' );
		const stepNumber = parts.length > 1 ? parts[ 1 ] : '1';
		return parseInt( stepNumber, 10 );
	}
	return 1;
}

function useChangeStepNumberForUrl( setActiveStepNumber: ( stepNumber: number ) => void ) {
	// If there is a step number on page load, remove it
	useEffect( () => {
		const newStepNumber = getStepNumberFromUrl();
		if ( newStepNumber ) {
			saveStepNumberToUrl( 1 );
		}
	}, [] ); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect( () => {
		let isSubscribed = true;
		window.addEventListener?.( 'hashchange', () => {
			const newStepNumber = getStepNumberFromUrl();
			debug( 'step number in url changed to', newStepNumber );
			isSubscribed && setActiveStepNumber( newStepNumber );
		} );
		return () => {
			isSubscribed = false;
		};
	}, [ setActiveStepNumber ] );
}

export function CheckoutStepGroup( {
	children,
	areStepsActive,
	stepAreaHeader,
}: {
	children: ReactNode;
	areStepsActive?: boolean;
	stepAreaHeader?: ReactNode;
} ): JSX.Element {
	return (
		<Checkout>
			{ stepAreaHeader }
			<CheckoutStepArea>
				<CheckoutSteps areStepsActive={ areStepsActive }>{ children }</CheckoutSteps>
			</CheckoutStepArea>
		</Checkout>
	);
}

const paymentMethodStepProps = getDefaultPaymentMethodStep();
export function PaymentMethodStep( props: Partial< CheckoutStepProps > ): JSX.Element {
	return <CheckoutStep { ...{ ...paymentMethodStepProps, ...props } } />;
}
PaymentMethodStep.isCheckoutStep = true;
