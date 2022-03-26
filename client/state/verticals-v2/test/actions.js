import { VERTICALS_V2_SET } from 'calypso/state/action-types';
import { requestVerticals, setVerticals } from '../actions';

describe( 'state/verticals-v2/actions', () => {
	test( 'requestVerticals', () => {
		const term = 'Foo';
		const limit = 7;

		expect( requestVerticals( term, limit ) ).toEqual( {
			type: VERTICALS_V2_SET,
			term,
			limit,
		} );
	} );

	test( 'setVerticals', () => {
		const term = 'Foo';
		const verticals = [
			{ id: 0, verticalName: 'vertical 1' },
			{ id: 1, verticalName: 'vertical 2' },
		];

		expect( setVerticals( term, verticals ) ).toEqual( {
			type: VERTICALS_V2_SET,
			term,
			verticals,
		} );
	} );
} );
