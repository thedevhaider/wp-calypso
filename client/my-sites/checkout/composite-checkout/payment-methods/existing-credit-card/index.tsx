import { Gridicon } from '@automattic/components';
import {
	Button,
	FormStatus,
	useLineItems,
	useFormStatus,
	PaymentLogo,
} from '@automattic/composite-checkout';
import styled from '@emotion/styled';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import debugFactory from 'debug';
import { useTranslate } from 'i18n-calypso';
import { Fragment, useCallback, useEffect, useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useDispatch } from 'react-redux';
import { PaymentMethodSummary } from 'calypso/lib/checkout/payment-methods';
import wpcom from 'calypso/lib/wp';
import {
	SummaryLine,
	SummaryDetails,
} from 'calypso/my-sites/checkout/composite-checkout/components/summary-details';
import TaxFields from 'calypso/my-sites/checkout/composite-checkout/components/tax-fields';
import useCountryList from 'calypso/my-sites/checkout/composite-checkout/hooks/use-country-list';
import { errorNotice } from 'calypso/state/notices/actions';
import PaymentMethodEditButton from './payment-method-edit-button';
import PaymentMethodEditDialog from './payment-method-edit-dialog';
import type { PaymentMethod, ProcessPayment, LineItem } from '@automattic/composite-checkout';
import type { ManagedContactDetails } from '@automattic/wpcom-checkout';

const debug = debugFactory( 'calypso:existing-card-payment-method' );

// Disabling this to make migration easier
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable wpcalypso/jsx-classname-namespace */

interface TaxInfo {
	tax_postal_code: string;
	tax_country_code: string;
}

interface TaxGetInfo extends TaxInfo {
	is_tax_info_set: boolean;
}

async function fetchTaxInfo( storedDetailsId: string ): Promise< TaxGetInfo > {
	return await wpcom.req.get( `/me/payment-methods/${ storedDetailsId }/tax-location` );
}

async function setTaxInfo(
	storedDetailsId: string,
	taxPostalCode: string,
	taxCountryCode: string
): Promise< TaxInfo > {
	return await wpcom.req.post( {
		path: `/me/payment-methods/${ storedDetailsId }/tax-location`,
		body: {
			tax_country_code: taxCountryCode,
			tax_postal_code: taxPostalCode,
		},
	} );
}

function joinNonEmptyValues( joinString: string, ...values: ( string | undefined )[] ) {
	return values.filter( ( value ) => value && value?.length > 0 ).join( joinString );
}

export function createExistingCardMethod( {
	id,
	cardholderName,
	cardExpiry,
	brand,
	last4,
	storedDetailsId,
	paymentMethodToken,
	paymentPartnerProcessorId,
	activePayButtonText,
	allowEditingTaxInfo,
	isTaxInfoRequired,
}: {
	id: string;
	cardholderName: string;
	cardExpiry: string;
	brand: string;
	last4: string;
	storedDetailsId: string;
	paymentMethodToken: string;
	paymentPartnerProcessorId: string;
	activePayButtonText?: string;
	allowEditingTaxInfo?: boolean;
	isTaxInfoRequired?: boolean;
} ): PaymentMethod {
	debug( 'creating a new existing credit card payment method', {
		id,
		cardholderName,
		cardExpiry,
		brand,
		last4,
	} );

	return {
		id,
		paymentProcessorId: 'existing-card',
		label: (
			<ExistingCardLabel
				last4={ last4 }
				storedDetailsId={ storedDetailsId }
				cardExpiry={ cardExpiry }
				cardholderName={ cardholderName }
				brand={ brand }
				paymentPartnerProcessorId={ paymentPartnerProcessorId }
				allowEditingTaxInfo={ allowEditingTaxInfo }
			/>
		),
		submitButton: (
			<ExistingCardPayButton
				cardholderName={ cardholderName }
				storedDetailsId={ storedDetailsId }
				paymentMethodToken={ paymentMethodToken }
				paymentPartnerProcessorId={ paymentPartnerProcessorId }
				activeButtonText={ activePayButtonText }
				isTaxInfoRequired={ isTaxInfoRequired }
			/>
		),
		inactiveContent: (
			<ExistingCardSummary
				cardholderName={ cardholderName }
				cardExpiry={ cardExpiry }
				brand={ brand }
				last4={ last4 }
			/>
		),
		getAriaLabel: () => `${ brand } ${ last4 } ${ cardholderName }`,
	};
}

function formatDate( cardExpiry: string ): string {
	const expiryDate = new Date( cardExpiry );
	const formattedDate = expiryDate.toLocaleDateString( 'en-US', {
		month: '2-digit',
		year: '2-digit',
	} );

	return formattedDate;
}

const CardDetails = styled.span`
	display: inline-block;
	margin-right: 8px;

	.rtl & {
		margin-right: 0;
		margin-left: 8px;
	}
`;

const CardHolderName = styled.span`
	display: block;
`;

function ExistingCardLabel( {
	last4,
	cardExpiry,
	cardholderName,
	brand,
	storedDetailsId,
	paymentPartnerProcessorId,
	allowEditingTaxInfo,
}: {
	last4: string;
	cardExpiry: string;
	cardholderName: string;
	brand: string;
	storedDetailsId: string;
	paymentPartnerProcessorId: string;
	allowEditingTaxInfo?: boolean;
} ): JSX.Element {
	const { __, _x } = useI18n();

	const [ isDialogVisible, setIsDialogVisible ] = useState( false );
	const [ inputValues, setInputValues ] = useState< TaxInfo >( {
		tax_country_code: '',
		tax_postal_code: '',
	} );
	const [ updateError, setUpdateError ] = useState( '' );
	const closeDialog = useCallback( () => {
		setUpdateError( '' );
		setIsDialogVisible( false );
	}, [] );
	const queryClient = useQueryClient();

	const queryKey = [ 'tax-info-is-set', storedDetailsId ];

	const { data: taxInfoFromServer, isLoading: isLoadingTaxInfo } = useQuery< TaxGetInfo, Error >(
		queryKey,
		() => fetchTaxInfo( storedDetailsId ),
		{}
	);

	const mutation = useMutation(
		( mutationInputValues: TaxInfo ) =>
			setTaxInfo(
				storedDetailsId,
				mutationInputValues.tax_postal_code,
				mutationInputValues.tax_country_code
			),
		{
			onMutate: async ( onMutateInputValues: TaxInfo ) => {
				// Stop any active fetches
				await queryClient.cancelQueries( queryKey );
				// Store previous fields so they can be restored if the data is invalid
				const previousData = queryClient.getQueryData( queryKey );
				// Optimistically update the fields
				queryClient.setQueryData( queryKey, {
					tax_postal_code: onMutateInputValues.tax_postal_code,
					tax_country_code: onMutateInputValues.tax_country_code,
					is_tax_info_set: true,
				} );
				return { previousData };
			},
			onError: ( error, _, context ) => {
				// Restore previous fields
				queryClient.setQueryData( queryKey, context?.previousData );
				setUpdateError( ( error as Error ).message );
			},
			onSuccess: ( onSuccessInputValues: TaxInfo ) => {
				queryClient.setQueryData( queryKey, {
					tax_postal_code: onSuccessInputValues.tax_postal_code,
					tax_country_code: onSuccessInputValues.tax_country_code,
					is_tax_info_set: true,
				} );
				closeDialog();
			},
		}
	);

	const openDialog = useCallback( () => {
		taxInfoFromServer && setInputValues( taxInfoFromServer );
		setIsDialogVisible( true );
	}, [ taxInfoFromServer ] );

	useEffect( () => {
		if ( ! taxInfoFromServer?.tax_country_code ) {
			return;
		}
		setInputValues( {
			tax_postal_code: taxInfoFromServer?.tax_postal_code ?? '',
			tax_country_code: taxInfoFromServer?.tax_country_code ?? '',
		} );
	}, [ taxInfoFromServer?.tax_country_code, taxInfoFromServer?.tax_postal_code ] );

	const countriesList = useCountryList();
	const updateTaxInfo = useCallback( () => {
		mutation.mutate( inputValues );
	}, [ mutation, inputValues ] );

	const onChangeTaxInfo = ( { postalCode, countryCode }: ManagedContactDetails ) => {
		setInputValues( {
			tax_country_code: countryCode?.value ?? '',
			tax_postal_code: postalCode?.value ?? '',
		} );
	};

	const taxInfoForForm = useMemo(
		() => ( {
			postalCode: {
				value: inputValues.tax_postal_code,
				errors: [],
				isTouched: true,
			},
			countryCode: {
				value: inputValues.tax_country_code,
				errors: [],
				isTouched: true,
			},
		} ),
		[ inputValues ]
	);

	/* translators: %s is the last 4 digits of the credit card number */
	const maskedCardDetails = sprintf( _x( '**** %s', 'Masked credit card number' ), last4 );

	return (
		<Fragment>
			<div>
				<CardHolderName>{ cardholderName }</CardHolderName>
				<CardDetails>{ maskedCardDetails }</CardDetails>
				<span>{ `${ __( 'Expiry:' ) } ${ formatDate( cardExpiry ) }` }</span>
				{ ! isLoadingTaxInfo && (
					<TaxInfoArea
						taxInfoFromServer={ taxInfoFromServer }
						openDialog={ openDialog }
						allowEditing={ !! allowEditingTaxInfo }
					/>
				) }
			</div>
			<div className="existing-credit-card__logo payment-logos">
				<PaymentLogo brand={ brand } isSummary={ true } />

				<PaymentMethodEditDialog
					paymentMethodSummary={
						<PaymentMethodSummary type={ brand || paymentPartnerProcessorId } digits={ last4 } />
					}
					isVisible={ isDialogVisible }
					onClose={ closeDialog }
					onConfirm={ updateTaxInfo }
					form={
						<TaxFields
							section={ `existing-card-payment-method-${ storedDetailsId }` }
							taxInfo={ taxInfoForForm }
							countriesList={ countriesList }
							onChange={ onChangeTaxInfo }
						/>
					}
					error={ updateError }
				/>
			</div>
		</Fragment>
	);
}

function TaxInfoArea( {
	taxInfoFromServer,
	openDialog,
	allowEditing,
}: {
	taxInfoFromServer: TaxGetInfo | undefined;
	openDialog: () => void;
	allowEditing: boolean;
} ) {
	const translate = useTranslate();
	const taxInfoDisplay = joinNonEmptyValues(
		', ',
		taxInfoFromServer?.tax_postal_code,
		taxInfoFromServer?.tax_country_code
	);
	const { formStatus } = useFormStatus();

	if ( ! allowEditing ) {
		return null;
	}
	if ( taxInfoDisplay ) {
		return (
			<span className="existing-credit-card__tax-info-display">
				<span className="existing-credit-card__tax-info-postal-country">{ taxInfoDisplay }</span>
			</span>
		);
	}
	return (
		<span className="existing-credit-card__tax-info-display tax-info-incomplete">
			<PaymentMethodEditButton
				onClick={ openDialog }
				buttonTextContent={ getMissingTaxLocationInformationMessage(
					translate,
					taxInfoFromServer
				) }
				scary={ true }
				borderless={ false }
				icon={ <Gridicon icon="notice" /> }
				disabled={ formStatus !== FormStatus.READY }
			/>
		</span>
	);
}

function getMissingTaxLocationInformationMessage(
	translate: ReturnType< typeof useTranslate >,
	taxInfoFromServer: TaxGetInfo | undefined
): string {
	const description = ! taxInfoFromServer?.tax_country_code
		? translate( 'Country', { textOnly: true } )
		: translate( 'Postal code', { textOnly: true } );
	return translate( 'Missing required %(description)s field', {
		args: { description },
		textOnly: true,
	} );
}

function ExistingCardPayButton( {
	disabled,
	onClick,
	cardholderName,
	storedDetailsId,
	paymentMethodToken,
	paymentPartnerProcessorId,
	activeButtonText,
	isTaxInfoRequired,
}: {
	disabled?: boolean;
	onClick?: ProcessPayment;
	cardholderName: string;
	storedDetailsId: string;
	paymentMethodToken: string;
	paymentPartnerProcessorId: string;
	activeButtonText?: string;
	isTaxInfoRequired?: boolean;
} ) {
	const [ items, total ] = useLineItems();
	const { formStatus } = useFormStatus();
	const translate = useTranslate();

	const { data: taxInfoFromServer, isLoading: isLoadingTaxInfo } = useQuery< TaxGetInfo, Error >(
		[ 'tax-info-is-set', storedDetailsId ],
		() => fetchTaxInfo( storedDetailsId )
	);

	const dispatch = useDispatch();

	// This must be typed as optional because it's injected by cloning the
	// element in CheckoutSubmitButton, but the uncloned element does not have
	// this prop yet.
	if ( ! onClick ) {
		throw new Error(
			'Missing onClick prop; ExistingCardPayButton must be used as a payment button in CheckoutSubmitButton'
		);
	}

	return (
		<Button
			disabled={ disabled || isLoadingTaxInfo }
			onClick={ () => {
				debug( 'submitting existing card payment' );
				if ( isTaxInfoRequired && ! taxInfoFromServer?.is_tax_info_set ) {
					dispatch(
						errorNotice( getMissingTaxLocationInformationMessage( translate, taxInfoFromServer ) )
					);
				} else {
					onClick( {
						items,
						name: cardholderName,
						storedDetailsId,
						paymentMethodToken,
						paymentPartnerProcessorId,
					} );
				}
			} }
			buttonType="primary"
			isBusy={ FormStatus.SUBMITTING === formStatus }
			fullWidth
		>
			<ButtonContents
				formStatus={ formStatus }
				total={ total }
				activeButtonText={ activeButtonText }
			/>
		</Button>
	);
}

function ButtonContents( {
	formStatus,
	total,
	activeButtonText,
}: {
	formStatus: string;
	total: LineItem;
	activeButtonText?: string;
} ): JSX.Element {
	const { __ } = useI18n();
	if ( formStatus === FormStatus.SUBMITTING ) {
		return <>{ __( 'Processing…' ) }</>;
	}
	if ( formStatus === FormStatus.READY ) {
		/* translators: %s is the total to be paid in localized currency */
		return <>{ activeButtonText || sprintf( __( 'Pay %s' ), total.amount.displayValue ) }</>;
	}
	return <>{ __( 'Please wait…' ) }</>;
}

function ExistingCardSummary( {
	cardholderName,
	cardExpiry,
	brand,
	last4,
}: {
	cardholderName: string;
	cardExpiry: string;
	brand: string;
	last4: string;
} ) {
	const { __, _x } = useI18n();

	/* translators: %s is the last 4 digits of the credit card number */
	const maskedCardDetails = sprintf( _x( '**** %s', 'Masked credit card number' ), last4 );

	return (
		<SummaryDetails>
			<SummaryLine>{ cardholderName }</SummaryLine>
			<SummaryLine>
				<PaymentLogo brand={ brand } isSummary={ true } />
				<CardDetails>{ maskedCardDetails }</CardDetails>
				<span>{ `${ __( 'Expiry:' ) } ${ formatDate( cardExpiry ) }` }</span>
			</SummaryLine>
		</SummaryDetails>
	);
}
