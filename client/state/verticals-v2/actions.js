import { VERTICALS_V2_REQUEST, VERTICALS_V2_SET } from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/verticals-v2';
import 'calypso/state/verticals-v2/init';

/**
 * Action creator: Request verticals data.
 *
 * @param {string} term The search term for requesting the matching verticals.
 * @param {number} limit The maximum number of vertical items.
 *
 * @returns {object} The action object.
 */
export const requestVerticals = ( term, limit ) => ( {
	type: VERTICALS_V2_REQUEST,
	term,
	limit,
} );

/**
 * Action creator: Store verticals found for a given search term in the state tree.
 *
 * @param {string} term The search term which the verticals data matching with.
 * @param {Array} verticals The verticals data matches with the given search term.
 *
 * @returns {object} The action object.
 */
export const setVerticals = ( term, verticals ) => ( {
	type: VERTICALS_V2_SET,
	term,
	verticals,
} );
