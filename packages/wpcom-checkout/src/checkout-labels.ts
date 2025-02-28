import {
	isPlan,
	isDomainTransfer,
	isDomainProduct,
	isDotComPlan,
	isGoogleWorkspace,
	isGSuiteOrExtraLicenseProductSlug,
	isTitanMail,
	isP2Plus,
	isJetpackProductSlug,
} from '@automattic/calypso-products';
import { translate } from 'i18n-calypso';
import { isWpComProductRenewal as isRenewal } from './is-wpcom-product-renewal';
import type { ResponseCartProduct } from '@automattic/shopping-cart';

export function getSublabel( serverCartItem: ResponseCartProduct ): string {
	const isRenewalItem = isRenewal( serverCartItem );
	const { meta, product_name: productName, product_slug: productSlug } = serverCartItem;

	if ( isDotComPlan( serverCartItem ) ) {
		if ( isRenewalItem ) {
			return String( translate( 'Plan Renewal' ) );
		}
	}

	if ( isPlan( serverCartItem ) || isJetpackProductSlug( productSlug ) ) {
		if ( isP2Plus( serverCartItem ) ) {
			return String( translate( 'Monthly subscription' ) );
		}

		return isRenewalItem
			? String( translate( 'Plan Renewal' ) )
			: String( translate( 'Plan Subscription' ) );
	}

	if ( isGoogleWorkspace( serverCartItem ) || isGSuiteOrExtraLicenseProductSlug( productSlug ) ) {
		if ( isRenewalItem ) {
			return String( translate( 'Mailboxes and Productivity Tools Renewal' ) );
		}

		return String( translate( 'Mailboxes and Productivity Tools' ) );
	}

	if ( isTitanMail( serverCartItem ) ) {
		if ( isRenewalItem ) {
			return String( translate( 'Mailboxes Renewal' ) );
		}

		return String( translate( 'Mailboxes' ) );
	}

	if ( meta && ( isDomainProduct( serverCartItem ) || isDomainTransfer( serverCartItem ) ) ) {
		if ( ! isRenewalItem ) {
			return productName || '';
		}

		if ( productName ) {
			return String( translate( '%(productName)s Renewal', { args: { productName } } ) );
		}
	}

	if ( ! isRenewalItem && serverCartItem.months_per_bill_period === 1 ) {
		return String( translate( 'Billed monthly' ) );
	}

	if ( isRenewalItem ) {
		return String( translate( 'Renewal' ) );
	}

	return '';
}

export function getLabel( serverCartItem: ResponseCartProduct ): string {
	if (
		serverCartItem.meta &&
		( isDomainProduct( serverCartItem ) || isDomainTransfer( serverCartItem ) )
	) {
		return serverCartItem.meta;
	}
	return serverCartItem.product_name || '';
}
