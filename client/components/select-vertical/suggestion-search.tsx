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
	autoFocus: boolean;
	isLoading: boolean;
	onInputChange?: () => void;
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
		( event: React.ChangeEventHandler< HTMLInputElement > ) => {
			setIsShowSuggestions( 0 < event.target.value.trim().length );
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
		if ( isLoading || ! isShowSuggestions ) {
			return [];
		}

		return suggestions.concat( [
			{
				value: '',
				label: translate( 'Something else' ),
				category: 0 < suggestions.length ? '—' : '',
			},
		] );
	}, [ suggestions, isLoading, isShowSuggestions ] );

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
					query={ searchTerm }
					suggestions={ getSuggestions }
					suggest={ handleSuggestionsSelect }
				/>
			</div>
		</>
	);
};

export default SelectVerticalSuggestionSearch;
