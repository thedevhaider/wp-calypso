import { Suggestions } from '@automattic/components';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useMemo, useRef, useState } from 'react';
import * as React from 'react';
import FormTextInput from 'calypso/components/forms/form-text-input';
import './style.scss';

interface Vertical {
	value: string;
	label: string;
	category?: string;
}

interface Props {
	placeholder?: string;
	searchTerm: string;
	suggestions: Vertical[];
	onInputChange?: () => void;
}

const MAX_SUGGESTIONS = 5;

const SelectVerticalSuggestionSearch: React.FC< Props > = ( {
	placeholder,
	searchTerm,
	suggestions,
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
		setIsFocused( true );
	}, [ setIsFocused ] );

	const handleTextInputChange = useCallback(
		( event: React.ChangeEventHandler< HTMLInputElement > ) => {
			setIsShowSuggestions( 0 < event.target.value.length );
			onInputChange?.( event.target.value );
		},
		[ setIsShowSuggestions, onInputChange ]
	);

	const handleTextInputKeyDown = useCallback(
		( event: React.KeyboardEventHandler< HTMLInputElement > ) => {
			if ( event.key === 'Enter' ) {
				event.preventDefault();
			}

			suggestionsRef.current?.handleKeyEvent( event );
		},
		[ suggestionsRef ]
	);

	const handleSuggestionsSelect = useCallback(
		( suggestion: Vertical ) => {
			setIsShowSuggestions( false );
			onInputChange?.( suggestion.label );
		},
		[ setIsShowSuggestions ]
	);

	const getSuggestions = useMemo( () => {
		if ( ! isShowSuggestions ) {
			return [];
		}

		// Show at most MAX_SUGGESTIONS results.
		if ( MAX_SUGGESTIONS <= suggestions.length ) {
			return suggestions.slice( 0, MAX_SUGGESTIONS );
		}

		return suggestions.concat( [
			{
				value: '',
				label: translate( 'Something else' ),
				category: 0 < suggestions.length ? '—' : '',
			},
		] );
	}, [ suggestions, isShowSuggestions ] );

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
					autoFocus={ true } // eslint-disable-line jsx-a11y/no-autofocus
				/>
				<Suggestions
					className="select-vertical__suggestion-search-dropdown"
					ref={ suggestionsRef }
					query={ searchTerm }
					suggestions={ getSuggestions }
					suggest={ handleSuggestionsSelect }
				/>
			</div>
		</>
	);
};

export default SelectVerticalSuggestionSearch;
