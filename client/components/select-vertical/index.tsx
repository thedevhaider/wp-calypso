import { useTranslate } from 'i18n-calypso';
import FormLabel from 'calypso/components/forms/form-label';
import SelectDropdown from 'calypso/components/select-dropdown';

interface Props {
	selectedVertical: string;
	onSelect: ( value: string ) => void;
}

/**
 * TODO: Query verticals from API and implement SelectVerticalDropdown or re-use SelectDropdown
 */
const SelectVertical = ( { selectedVertical, onSelect }: Props ) => {
	const translate = useTranslate();

	return (
		<>
			<FormLabel>{ translate( 'Select a category' ) }</FormLabel>
			<SelectDropdown options={ [] } selectedText={ selectedVertical } onSelect={ onSelect } />
		</>
	);
};

export default SelectVertical;
