import { get } from 'lodash';

import 'calypso/state/verticals-v2/init';

export const getVerticals = ( state, searchTerm = '' ) => {
	const term = searchTerm.trim().toLowerCase();
	if ( '' === term ) {
		return get( state, [ 'verticalsV2All' ], null );
	}

	return get( state, [ 'verticalsV2', term ], null );
};
