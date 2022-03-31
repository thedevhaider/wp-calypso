import { useQuery, UseQueryResult, QueryKey } from 'react-query';
import wpcom from 'calypso/lib/wp';
import { mapManyVerticalsApiToVertical } from './utils';
import type {
	SiteVerticalsVerticalApi,
	SiteVerticalsVertical,
	SiteVerticalsQueryParams,
	SiteVerticalsQueryOptions,
} from './types';

const defaults = {
	term: '',
	limit: 10,
	skip_synonyms: false,
};

const useSiteVerticalsQuery = (
	fetchOptions: SiteVerticalsQueryParams = {},
	queryOptions: SiteVerticalsQueryOptions = {}
): UseQueryResult< SiteVerticalsVertical[] > => {
	return useQuery(
		getCacheKey( fetchOptions.term || '' ),
		() => fetchSiteVerticals( { ...defaults, ...fetchOptions } ),
		{
			select: mapManyVerticalsApiToVertical,
			staleTime: Infinity,
			refetchInterval: false,
			refetchOnMount: 'always',
			...queryOptions,
		}
	);
};

export function fetchSiteVerticals(
	params: SiteVerticalsQueryParams
): Promise< SiteVerticalsVerticalApi[] > {
	return wpcom.req.get(
		{
			apiNamespace: 'wpcom/v2',
			path: '/site-verticals',
		},
		params
	);
}

export function getCacheKey( term: string ): QueryKey {
	return [ 'site-verticals', term ];
}

export default useSiteVerticalsQuery;
