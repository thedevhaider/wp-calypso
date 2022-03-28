import { Suggestions } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { useCallback, useMemo, useRef, useState } from 'react';
import * as React from 'react';
import { connect } from 'react-redux';
import QueryVerticalsV2 from 'calypso/components/data/query-verticals-v2';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { getVerticals } from 'calypso/state/verticals-v2/selectors';
import './style.scss';

interface Vertical {
	label: string;
	value: string;
}

interface Props {
	verticals: Vertical[];
}

const SelectVerticalSuggestionSearch: React.FC< Props > = ( { verticals } ) => {
	const [ searchTerm, setSearchTerm ] = useState( '' );
	const [ isShowSuggestions, setIsShowSuggestions ] = useState( false );
	const suggestionsRef = useRef( null );

	const handleTextInputChange: React.ChangeEventHandler< HTMLInputElement > = useCallback(
		( event ) => {
			setSearchTerm( event.target.value );
			setIsShowSuggestions( true );
		},
		[ setSearchTerm ]
	);

	const handleTextInputKeyDown: React.KeyboardEventHandler< HTMLInputElement > = useCallback(
		( event ) => {
			if ( verticals.length > 0 && event.key === 'Enter' ) {
				event.preventDefault();
			}

			suggestionsRef.current?.handleKeyEvent( event );
		},
		[ suggestionsRef, verticals ]
	);

	const handleSuggestionsSelect = useCallback(
		( suggestion ) => {
			setSearchTerm( suggestion.label );
			setIsShowSuggestions( false );
		},
		[ setSearchTerm ]
	);

	const getSuggestions = useMemo( () => {
		if ( ! isShowSuggestions ) {
			return [];
		}

		return verticals;
	}, [ verticals, isShowSuggestions ] );

	return (
		<>
			<QueryVerticalsV2 searchTerm={ searchTerm } />
			<div className="select-vertical__suggestion-search">
				<FormTextInput
					value={ searchTerm }
					placeholder={ 'Ex. Restaurant' }
					onChange={ handleTextInputChange }
					onKeyDown={ handleTextInputKeyDown }
					autoComplete="off"
				/>
				<Suggestions
					ref={ suggestionsRef }
					query={ searchTerm }
					suggestions={ getSuggestions }
					suggest={ handleSuggestionsSelect }
				/>
			</div>
		</>
	);
};

export default connect( ( state ) => {
	return {
		verticals: getVerticals( state, '' ) || [],
	};
}, null )( localize( SelectVerticalSuggestionSearch ) );
