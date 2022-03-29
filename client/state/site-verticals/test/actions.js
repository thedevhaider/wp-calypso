import { SITE_VERTICALS_SET } from 'calypso/state/action-types';
import { requestVerticals, setVerticals } from '../actions';

describe( 'state/site-verticals/actions', () => {
	test( 'requestVerticals', () => {
		const term = 'Foo';
		const limit = 7;

		expect( requestVerticals( term, limit ) ).toEqual( {
			type: SITE_VERTICALS_SET,
			term,
			limit,
		} );
	} );

	test( 'setVerticals', () => {
		const term = 'Foo';
		const verticals = [
			{ id: 0, title: 'vertical 1' },
			{ id: 1, title: 'vertical 2' },
		];

		expect( setVerticals( term, verticals ) ).toEqual( {
			type: SITE_VERTICALS_SET,
			term,
			verticals,
		} );
	} );
} );
