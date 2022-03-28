import { useTranslate } from 'i18n-calypso';
import FormLabel from 'calypso/components/forms/form-label';
import SuggestionSearch from './suggestion-search';

const SelectVertical = () => {
	const translate = useTranslate();

	return (
		<>
			<FormLabel>{ translate( 'Select a category' ) }</FormLabel>
			<SuggestionSearch />
		</>
	);
};

export default SelectVertical;
