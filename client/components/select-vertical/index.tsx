import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { connect } from 'react-redux';
import QuerySiteVerticals from 'calypso/components/data/query-site-verticals';
import FormLabel from 'calypso/components/forms/form-label';
import { getVerticals } from 'calypso/state/site-verticals/selectors';
import SuggestionSearch from './suggestion-search';

export interface Vertical {
	value: string;
	label: string;
	category?: string;
}

interface Props {
	suggestions?: Vertical[] | undefined;
	searchTerm: string;
	autoFocus: boolean;
	isLoading?: boolean;
	isSkipSynonyms?: boolean;
	onInputChange?: ( value: string ) => void;
}

const SelectVertical: React.FC< Props > = ( {
	suggestions = [],
	searchTerm,
	autoFocus,
	isLoading,
	isSkipSynonyms,
	onInputChange,
} ) => {
	const translate = useTranslate();
	const handleSuggestionInputChange = useCallback(
		( term: string ) => {
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
				placeholder={ String( translate( 'Ex. Cafes, Education, Photography' ) ) }
				searchTerm={ searchTerm }
				suggestions={ suggestions }
				isLoading={ isLoading }
				autoFocus={ autoFocus } // eslint-disable-line jsx-a11y/no-autofocus
				onInputChange={ handleSuggestionInputChange }
			/>
		</>
	);
};

export default connect( ( state, ownProps: Props ) => {
	const verticals = getVerticals( state, ownProps.searchTerm );

	return {
		suggestions: verticals || [],
		isLoading: null === verticals,
	};
}, null )( SelectVertical );
