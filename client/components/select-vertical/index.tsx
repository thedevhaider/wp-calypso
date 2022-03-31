import { TranslateResult, useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { connect } from 'react-redux';
import QuerySiteVerticals from 'calypso/components/data/query-site-verticals';
import FormLabel from 'calypso/components/forms/form-label';
import { getVerticals } from 'calypso/state/site-verticals/selectors';
import SuggestionSearch from './suggestion-search';

export interface Vertical {
	value: string;
	label: TranslateResult | string;
	category?: string;
}

export interface Suggestion {
	label: string;
	category?: string;
}

interface Props {
	suggestions: Vertical[];
	searchTerm: string;
	autoFocus: boolean;
	isLoading: boolean;
	isSkipSynonyms?: boolean;
	onInputChange?: ( value: TranslateResult | string ) => void;
}

const SelectVertical: React.FC< Props > = ( {
	searchTerm,
	suggestions,
	autoFocus,
	isLoading,
	isSkipSynonyms,
	onInputChange,
} ) => {
	const translate = useTranslate();
	const handleSuggestionInputChange = useCallback(
		( term: TranslateResult | string ) => {
			onInputChange?.( term );
		},
		[ onInputChange ]
	);

	return (
		<>
			<QuerySiteVerticals
				searchTerm={ searchTerm }
				debounceTime={ 300 }
				isSkipSynonyms={ isSkipSynonyms }
			/>
			<FormLabel>{ translate( 'Select a category' ) }</FormLabel>
			<SuggestionSearch
				placeholder={ translate( 'Ex. Cafes, Education, Photography' ) }
				searchTerm={ searchTerm }
				suggestions={ suggestions }
				isLoading={ isLoading }
				autoFocus={ autoFocus } // eslint-disable-line jsx-a11y/no-autofocus
				onInputChange={ handleSuggestionInputChange }
			/>
		</>
	);
};

export default connect( ( state, ownProps ) => {
	const verticals = getVerticals( state, ownProps.searchTerm );

	return {
		suggestions: verticals || [],
		isLoading: null === verticals,
	};
}, null )( SelectVertical );
