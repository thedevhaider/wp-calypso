import { translate } from 'i18n-calypso';
import { SITE_VERTICALS_REQUEST } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { convertToCamelCase } from 'calypso/state/data-layer/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import { errorNotice } from 'calypso/state/notices/actions';
import { getCurrentFlowName } from 'calypso/state/signup/flow/selectors';
import { setVerticals } from 'calypso/state/site-verticals/actions';

export const requestVerticals = ( action ) => {
	return http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'GET',
			path: '/site-verticals',
			query: {
				term: action.term.trim(),
				limit: action.limit,
			},
		},
		action
	);
};

export const storeVerticals = ( { term }, verticals ) => setVerticals( term, verticals );
export const showVerticalsRequestError = () =>
	errorNotice(
		translate( 'We encountered an error on fetching data from our server. Please try again.' )
	);

const verticalsHandlers = dispatchRequest( {
	fetch: requestVerticals,
	onSuccess: storeVerticals,
	onError: showVerticalsRequestError,
	fromApi: convertToCamelCase,
} );

registerHandlers( 'state/data-layer/wpcom/site-verticals', {
	[ SITE_VERTICALS_REQUEST ]: [
		( store, action ) =>
			verticalsHandlers( store, {
				...action,
				flowName: getCurrentFlowName( store.getState() ),
			} ),
	],
} );
