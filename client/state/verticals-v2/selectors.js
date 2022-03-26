import { get } from 'lodash';

import 'calypso/state/verticals-v2/init';

export const getVerticals = ( state, searchTerm = '' ) =>
	get( state, [ 'verticals-v2', searchTerm.trim().toLowerCase() ], null );
