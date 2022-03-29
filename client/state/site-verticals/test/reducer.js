import { SITE_VERTICALS_SET } from 'calypso/state/action-types';
import reducer from '../reducer';

describe( 'state/site-verticals/reducer', () => {
	test( 'should default to an empty object', () => {
		expect( reducer( undefined, {} ) ).toEqual( {} );
	} );

	test( 'should associate a trimmed and lowercase search string to the verticals array.', () => {
		const term = 'Foo';
		const verticals = [
			{ id: 0, title: 'Coffee' },
			{ id: 1, title: 'Tea' },
		];

		expect(
			reducer( undefined, {
				type: SITE_VERTICALS_SET,
				term,
				verticals,
			} )
		).toEqual( {
			foo: verticals,
		} );
	} );
} );
