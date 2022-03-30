import { shallow } from 'enzyme';
import { QuerySiteVerticals } from '../';

describe( 'QuerySiteVerticals', () => {
	test( 'should mount as an empty object', () => {
		const wrapped = shallow( <QuerySiteVerticals /> );

		expect( wrapped ).toEqual( {} );
	} );

	test( 'should call request on mount.', () => {
		const requestVerticals = jest.fn();

		shallow( <QuerySiteVerticals requestVerticals={ requestVerticals } searchTerm="Foo" /> );

		expect( requestVerticals ).toHaveBeenCalled();
	} );

	test( 'should not call request on mount if no search term is given.', () => {
		const requestVerticals = jest.fn();

		shallow( <QuerySiteVerticals requestVerticals={ requestVerticals } /> );

		expect( requestVerticals ).not.toHaveBeenCalled();
	} );

	test( 'should not call request on mount if a matching fetched result is found in state.', () => {
		const requestVerticals = jest.fn();

		shallow( <QuerySiteVerticals requestVerticals={ requestVerticals } isFetched={ true } /> );

		expect( requestVerticals ).not.toHaveBeenCalled();
	} );

	test( 'should call request on update if no matching fetched result is found in state.', () => {
		const requestVerticals = jest.fn();

		const wrapped = shallow( <QuerySiteVerticals requestVerticals={ requestVerticals } /> );

		const updatedProps = {
			searchTerm: 'Foo',
			limit: 7,
			isFetched: false,
		};

		wrapped.setProps( updatedProps );

		expect( requestVerticals ).toHaveBeenCalledWith(
			updatedProps.searchTerm,
			updatedProps.limit,
			updatedProps.isFetched
		);
	} );

	test( 'should not call request on update if a matching fetched result is found in state.', () => {
		const requestVerticals = jest.fn();

		const wrapped = shallow( <QuerySiteVerticals requestVerticals={ requestVerticals } /> );

		const updatedProps = {
			searchTerm: 'Foo',
			limit: 7,
			isFetched: true,
		};

		wrapped.setProps( updatedProps );

		expect( requestVerticals ).not.toHaveBeenCalled();
	} );

	test( 'should create a debounce-wrapped function if debounce time is more than 0 on mount.', () => {
		const requestVerticals = jest.fn();
		const debounceFunc = jest.fn();
		const debounceTime = 100;

		shallow(
			<QuerySiteVerticals
				requestVerticals={ requestVerticals }
				debounceFunc={ debounceFunc }
				debounceTime={ debounceTime }
			/>
		);

		expect( debounceFunc ).toHaveBeenCalledWith( requestVerticals, debounceTime );
	} );

	test( 'should not create a debounce-wrapped function if debounce time is 0.', () => {
		const requestVerticals = jest.fn();
		const debounceFunc = jest.fn();

		shallow(
			<QuerySiteVerticals
				requestVerticals={ requestVerticals }
				debounceFunc={ debounceFunc }
				debounceTime={ 0 }
			/>
		);

		expect( debounceFunc ).not.toHaveBeenCalled();
	} );

	test( 'should update the debounced function if the debounce time has changed.', () => {
		const requestVerticals = jest.fn();
		const debounceFunc = jest.fn();

		const wrapped = shallow(
			<QuerySiteVerticals
				requestVerticals={ requestVerticals }
				debounceFunc={ debounceFunc }
				debounceTime={ 100 }
			/>
		);

		const updatedDebounceTime = 200;

		wrapped.setProps( {
			debounceTime: updatedDebounceTime,
		} );

		expect( debounceFunc ).toHaveBeenCalledWith( requestVerticals, updatedDebounceTime );
	} );

	test( 'should not update the debounced function if the debounce time keeps the same.', () => {
		const requestVerticals = jest.fn();
		const debounceFunc = jest.fn();
		const debounceTime = 100;

		const wrapped = shallow(
			<QuerySiteVerticals
				requestVerticals={ requestVerticals }
				debounceFunc={ debounceFunc }
				debounceTime={ debounceTime }
			/>
		);

		debounceFunc.mockClear();

		wrapped.setProps( {
			debounceTime,
		} );

		expect( debounceFunc ).not.toHaveBeenCalled();
	} );
} );
