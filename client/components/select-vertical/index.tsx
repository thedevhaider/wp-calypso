import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { connect } from 'react-redux';
import QuerySiteVerticals from 'calypso/components/data/query-site-verticals';
import FormLabel from 'calypso/components/forms/form-label';
import { setSiteVertical } from 'calypso/state/signup/steps/site-vertical/actions';
import { getSiteVerticalName } from 'calypso/state/signup/steps/site-vertical/selectors';
import { getVerticals } from 'calypso/state/site-verticals/selectors';
import SuggestionSearch from './suggestion-search';

interface Vertical {
	value: string;
	label: string;
	category?: string;
}

interface Props {
	suggestions: Vertical[];
	searchTerm: string;
	isLoading: boolean;
	isSkipSynonyms?: boolean;
	setSiteVertical?: () => void;
}

const SelectVertical: React.FC< Props > = ( {
	searchTerm,
	suggestions,
	isLoading,
	isSkipSynonyms,
	setSiteVertical,
} ) => {
	const translate = useTranslate();
	const handleSuggestionInputChange = useCallback(
		( term: string ) => {
			setSiteVertical( { name: term } );
		},
		[ setSiteVertical ]
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
				onInputChange={ handleSuggestionInputChange }
			/>
		</>
	);
};

export default connect(
	( state ) => {
		const searchTerm = getSiteVerticalName( state );
		const verticals = getVerticals( state, searchTerm );

		return {
			searchTerm,
			suggestions: verticals || [],
			isLoading: null === verticals,
		};
	},
	{
		setSiteVertical,
	}
)( SelectVertical );
