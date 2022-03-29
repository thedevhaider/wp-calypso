import { get } from 'lodash';

import 'calypso/state/site-verticals/init';

export const getVerticals = ( state, searchTerm = '' ) => {
	return get( state, [ 'siteVerticals', searchTerm.trim().toLowerCase() ], null );
};
