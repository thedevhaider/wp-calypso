import { getVerticals } from '../selectors';

describe( 'state/verticals-v2/selectors', () => {
	describe( 'getVerticals()', () => {
		test( 'should default to null.', () => {
			expect( getVerticals( {}, 'aaa' ) ).toBeNull();
		} );

		const searchTerm = 'cool';
		const state = {
			'verticals-v2': {
				[ searchTerm ]: [
					{ id: 0, verticalName: 'Ah!' },
					{ id: 1, verticalName: 'I am selected!' },
				],
			},
		};

		test( 'should return the stored verticals data.', () => {
			expect( getVerticals( state, searchTerm ) ).toEqual( state[ 'verticals-v2' ][ searchTerm ] );
		} );

		test( 'should return null if it does not exist', () => {
			expect( getVerticals( state, 'Aaa' ) ).toBeNull();
			expect( getVerticals( state, searchTerm ) ).toBeNull();
		} );

		test( 'should return correct results from mixed case and untrimmed value', () => {
			expect( getVerticals( state, ' COOL ' ) ).toEqual( state[ 'verticals-v2' ][ searchTerm ] );
		} );
	} );
} );
