import { VERTICALS_V2_SET } from 'calypso/state/action-types';
import reducer from '../reducer';

describe( 'state/verticals-v2/suggestions/reducer', () => {
	test( 'should default to an empty object', () => {
		expect( reducer( undefined, {} ) ).toEqual( {} );
	} );

	test( 'should associate a trimmed and lowercase search string to the verticals array.', () => {
		const term = 'Foo';
		const verticals = [
			{ id: 0, verticalName: 'Coffee' },
			{ id: 1, verticalName: 'Tea' },
		];

		expect(
			reducer( undefined, {
				type: VERTICALS_V2_SET,
				term,
				verticals,
			} )
		).toEqual( {
			foo: verticals,
		} );
	} );
} );
