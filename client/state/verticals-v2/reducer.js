import { withStorageKey } from '@automattic/state-utils';
import { VERTICALS_V2_SET } from 'calypso/state/action-types';

function normalize( verticals = [] ) {
	return verticals.map( ( vertical ) => {
		return {
			label: vertical.verticalName,
			value: vertical.verticalId,
		};
	} );
}

const allReducer = withStorageKey( 'verticalsV2All', ( state = {}, action ) => {
	if ( action.type === VERTICALS_V2_SET ) {
		return normalize( action.verticals );
	}

	return state;
} );

const searchReducer = withStorageKey( 'verticalsV2', ( state = {}, action ) => {
	if ( action.type === VERTICALS_V2_SET ) {
		return {
			...state,
			[ action.term.trim().toLowerCase() ]: normalize( action.verticals ),
		};
	}

	return state;
} );

export { allReducer, searchReducer };
