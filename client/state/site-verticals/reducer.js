import { withStorageKey } from '@automattic/state-utils';
import { translate } from 'i18n-calypso';
import { SITE_VERTICALS_SET } from 'calypso/state/action-types';

function normalize( verticals = [] ) {
	return verticals.map( ( vertical ) => {
		return {
			value: vertical.id,
			label: vertical.title,
			category: String( translate( 'Suggestions' ) ),
		};
	} );
}

const reducer = ( state = {}, action ) => {
	if ( action.type === SITE_VERTICALS_SET ) {
		return {
			...state,
			[ action.term.trim().toLowerCase() ]: normalize( action.verticals ),
		};
	}

	return state;
};

export default withStorageKey( 'siteVerticals', reducer );
