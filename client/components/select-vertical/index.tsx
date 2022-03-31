import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import FormLabel from 'calypso/components/forms/form-label';
import { useSiteVerticalsQuery } from 'calypso/data/site-verticals';
import SuggestionSearch from './suggestion-search';
import type {
	SiteVerticalsQueryParams,
	SiteVerticalsQueryOptions,
} from 'calypso/data/site-verticals';

interface Props {
	searchTerm: string;
	autoFocus: boolean;
	isSkipSynonyms?: boolean;
	onInputChange?: ( value: string ) => void;
}

const SelectVertical: React.FC< Props > = ( {
	searchTerm,
	autoFocus,
	isSkipSynonyms,
	onInputChange,
} ) => {
	const translate = useTranslate();
	const [ debouncedSearchTerm ] = useDebounce( searchTerm, 300 );
	const { data: suggestions } = useSiteVerticalsQuery(
		{ term: debouncedSearchTerm, skip_synonyms: isSkipSynonyms } as SiteVerticalsQueryParams,
		{ enabled: '' !== debouncedSearchTerm } as SiteVerticalsQueryOptions
	);

	const handleSuggestionInputChange = useCallback(
		( term: string ) => {
			onInputChange?.( term );
		},
		[ onInputChange ]
	);

	return (
		<>
			<FormLabel>{ translate( 'Select a category' ) }</FormLabel>
			<SuggestionSearch
				placeholder={ String( translate( 'Ex. Cafes, Education, Photography' ) ) }
				searchTerm={ searchTerm }
				suggestions={ suggestions || [] }
				isLoading={ undefined === suggestions }
				autoFocus={ autoFocus } // eslint-disable-line jsx-a11y/no-autofocus
				onInputChange={ handleSuggestionInputChange }
			/>
		</>
	);
};

export default SelectVertical;
