import { VERTICALS_V2_SET } from 'calypso/state/action-types';
import { keyedReducer } from 'calypso/state/utils';

export default keyedReducer( 'siteType', ( state = null, action ) => {
	if ( action.type === VERTICALS_V2_SET ) {
		return {
			...state,
			[ action.term.trim().toLowerCase() ]: action.verticals,
		};
	}
	return state;
} );
