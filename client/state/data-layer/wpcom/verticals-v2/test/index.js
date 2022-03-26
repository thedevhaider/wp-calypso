import { NOTICE_CREATE } from 'calypso/state/action-types';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { setVerticals } from 'calypso/state/verticals-v2/suggestions/actions';
import { requestVerticals, storeVerticals, showVerticalsRequestError } from '../';

describe( 'data-layer/wpcom/verticals-v2', () => {
	test( 'requestVerticals()', () => {
		const mockAction = {
			term: 'Foo',
			limit: 7,
		};

		expect( requestVerticals( mockAction ) ).toEqual(
			http(
				{
					apiNamespace: 'wpcom/v2',
					method: 'GET',
					path: '/verticals/suggest',
					query: {
						term: mockAction.term,
						limit: mockAction.limit,
					},
				},
				mockAction
			)
		);
	} );

	test( 'storeVerticals()', () => {
		const term = 'Profit!';
		const verticals = [
			{ id: 0, verticalName: 'More Profit!' },
			{ id: 1, verticalName: 'Superfluous Profit!' },
		];

		expect( storeVerticals( { term }, verticals ) ).toEqual( setVerticals( term, verticals ) );
	} );

	test( 'showVerticalsRequestError()', () => {
		const errorNotice = showVerticalsRequestError();

		expect( errorNotice.type ).toEqual( NOTICE_CREATE );
		expect( errorNotice.notice.status ).toEqual( 'is-error' );
	} );
} );
