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
	verticals: Vertical[];
	searchTerm: string;
	setSiteVertical?: () => void;
}

const SelectVertical: React.FC< Props > = ( { searchTerm, verticals, setSiteVertical } ) => {
	const translate = useTranslate();
	const handleSuggestionInputChange = useCallback(
		( term: string ) => {
			setSiteVertical( { name: term } );
		},
		[ setSiteVertical ]
	);

	return (
		<>
			<QuerySiteVerticals searchTerm={ searchTerm } />
			<FormLabel>{ translate( 'Select a category' ) }</FormLabel>
			<SuggestionSearch
				placeholder={ translate( 'Ex. Cafes, Education, Photography' ) }
				searchTerm={ searchTerm }
				suggestions={ verticals }
				onInputChange={ handleSuggestionInputChange }
			/>
		</>
	);
};

export default connect(
	( state ) => {
		const searchTerm = getSiteVerticalName( state );

		return {
			searchTerm,
			verticals: getVerticals( state, searchTerm ) || [],
		};
	},
	{
		setSiteVertical,
	}
)( SelectVertical );
