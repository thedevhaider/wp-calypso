import { SITE_VERTICALS_REQUEST, SITE_VERTICALS_SET } from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/site-verticals';
import 'calypso/state/site-verticals/init';

/**
 * Action creator: Request verticals data.
 *
 * @param {string} term The search term for requesting the matching verticals.
 * @param {number} limit The maximum number of vertical items.
 *
 * @returns {object} The action object.
 */
export const requestVerticals = ( term, limit ) => ( {
	type: SITE_VERTICALS_REQUEST,
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
	type: SITE_VERTICALS_SET,
	term,
	verticals,
} );
