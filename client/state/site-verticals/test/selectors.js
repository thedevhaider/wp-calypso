import { getVerticals } from '../selectors';

describe( 'state/site-verticals/selectors', () => {
	describe( 'getVerticals()', () => {
		test( 'should default to null.', () => {
			expect( getVerticals( {}, 'aaa' ) ).toBeNull();
		} );

		const searchTerm = 'cool';
		const state = {
			siteVerticals: {
				[ searchTerm ]: [
					{ id: 0, title: 'Ah!' },
					{ id: 1, title: 'I am selected!' },
				],
			},
		};

		test( 'should return the stored verticals data.', () => {
			expect( getVerticals( state, searchTerm ) ).toEqual( state[ siteVerticals ][ searchTerm ] );
		} );

		test( 'should return null if it does not exist', () => {
			expect( getVerticals( state, 'Aaa' ) ).toBeNull();
			expect( getVerticals( state, searchTerm ) ).toBeNull();
		} );

		test( 'should return correct results from mixed case and untrimmed value', () => {
			expect( getVerticals( state, ' COOL ' ) ).toEqual( state[ siteVerticals ][ searchTerm ] );
		} );
	} );
} );
