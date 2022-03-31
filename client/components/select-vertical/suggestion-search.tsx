import { Suggestions } from '@automattic/components';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useRef, useState } from 'react';
import * as React from 'react';
import FormTextInput from 'calypso/components/forms/form-text-input';
import type { SiteVerticalsVertical } from 'calypso/data/site-verticals';
import './style.scss';

interface Props {
	placeholder?: string;
	searchTerm: string;
	suggestions: SiteVerticalsVertical[];
	autoFocus: boolean;
	isLoading?: boolean | undefined;
	onInputChange?: ( value: string ) => void;
}

const SelectVerticalSuggestionSearch: React.FC< Props > = ( {
	placeholder,
	searchTerm,
	suggestions,
	autoFocus,
	isLoading,
	onInputChange,
} ) => {
	const [ isShowSuggestions, setIsShowSuggestions ] = useState( false );
	const [ isFocused, setIsFocused ] = useState( false );
	const suggestionsRef = useRef( null );
	const translate = useTranslate();

	const handleTextInputBlur = useCallback( () => {
		setIsFocused( false );
	}, [ setIsFocused ] );

	const handleTextInputFocus = useCallback( () => {
		if ( 0 < suggestions.length ) {
			setIsShowSuggestions( true );
		}

		setIsFocused( true );
	}, [ suggestions, setIsFocused, setIsShowSuggestions ] );

	const handleTextInputChange = useCallback(
		( event: React.ChangeEvent< HTMLInputElement > ) => {
			setIsShowSuggestions( 0 < event.target.value.trim().length );
			onInputChange?.( event.target.value );
		},
		[ setIsShowSuggestions, onInputChange ]
	);

	const handleTextInputKeyDown = useCallback(
		( event: KeyboardEvent ) => {
			if ( event.key === 'Enter' ) {
				event.preventDefault();
			}

			if ( suggestionsRef.current ) {
				( suggestionsRef.current as Suggestions ).handleKeyEvent( event );
			}
		},
		[ suggestionsRef ]
	);

	const handleSuggestionsSelect = useCallback(
		( { label }: { label: string } ) => {
			setIsShowSuggestions( false );
			onInputChange?.( label );
		},
		[ setIsShowSuggestions, onInputChange ]
	);

	const getSuggestions = useMemo( () => {
		if ( isLoading || ! isShowSuggestions ) {
			return [];
		}

		return suggestions.concat( [
			{
				value: '',
				label: String( translate( 'Something else' ) ),
				category: 0 < suggestions.length ? '—' : '',
			},
		] );
	}, [ translate, suggestions, isLoading, isShowSuggestions ] );

	return (
		<>
			<div
				className={ classnames( 'select-vertical__suggestion-search', {
					'is-focused': isFocused,
					'is-show-suggestions': isShowSuggestions,
				} ) }
			>
				<FormTextInput
					value={ searchTerm }
					placeholder={ placeholder }
					onBlur={ handleTextInputBlur }
					onFocus={ handleTextInputFocus }
					onChange={ handleTextInputChange }
					onKeyDown={ handleTextInputKeyDown }
					autoComplete="off"
					autoFocus={ autoFocus } // eslint-disable-line jsx-a11y/no-autofocus
				/>
				<Suggestions
					className="select-vertical__suggestion-search-dropdown"
					ref={ suggestionsRef }
					title=""
					query={ searchTerm }
					suggestions={ getSuggestions }
					suggest={ handleSuggestionsSelect }
				/>
			</div>
		</>
	);
};

export default SelectVerticalSuggestionSearch;
